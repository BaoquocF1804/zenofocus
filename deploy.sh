#!/bin/bash

# Configuration
SERVER_IP="207.148.79.36"
SERVER_USER="root"
REMOTE_PATH="/var/www/zenofocus"
# Set your domain name here (e.g., "example.com" or "www.example.com")
# Leave empty to use IP address only (HTTPS will still work but with IP)
DOMAIN="zenfocus.site"  # Your domain: zenfocus.site

echo "🚀 Starting deployment to $SERVER_IP..."

# Step 1: Create remote directory
echo "📂 Creating remote directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_PATH"

# Step 2: Sync files
echo "cw Syncing files (this may take a while)..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' ./ $SERVER_USER@$SERVER_IP:$REMOTE_PATH

# Step 3: Remote setup and build
echo "hammer_and_wrench Building and starting application on server..."
ssh $SERVER_USER@$SERVER_IP "export DOMAIN='$DOMAIN' && export SERVER_IP='$SERVER_IP' && bash -s" << 'EOF'
    # Ensure we have a robust path
    export PATH=$PATH:/usr/bin:/usr/local/bin

    # Install NVM and Node 20
    echo "📦 Checking Node.js version..."
    if ! command -v nvm &> /dev/null; then
        echo "   Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    fi
    
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    echo "   Installing/Using Node 20..."
    nvm install 20
    nvm use 20
    nvm alias default 20

    # Verify Node version
    node -v
    npm -v

    cd /var/www/zenofocus

    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install

    # Build frontend
    echo "🏗️ Building frontend..."
    npm run build

    # Install and configure Nginx
    echo "🌐 Installing and configuring Nginx..."
    if ! command -v nginx > /dev/null; then
        echo "   Installing Nginx..."
        apt-get update -qq
        apt-get install -y nginx
    fi

    # Install Certbot for SSL
    echo "🔒 Installing Certbot for SSL certificates..."
    if ! command -v certbot > /dev/null; then
        apt-get install -y certbot python3-certbot-nginx
    fi

    # Firewall setup
    echo "🛡️ Configuring firewall..."
    if command -v ufw > /dev/null; then
        echo "   Found UFW. Allowing ports 80, 443 and 22..."
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 22/tcp
    else
        echo "⚠️ UFW not found. If you have another firewall (like iptables), please open ports 80 and 443."
    fi

    # Start/Restart with PM2
    echo "🚀 Starting application..."
    if ! command -v pm2 &> /dev/null; then
        echo "⚠️ PM2 not found. Installing PM2..."
        npm install -g pm2
    fi

    # Delete existing process to ensure clean slate with new Node version
    pm2 delete zenofocus 2>/dev/null || true
    
    # Get the full path to node from NVM
    NODE_PATH=$(which node)
    echo "   Using Node at: $NODE_PATH"
    
    # Verify dist folder exists
    if [ ! -d "/var/www/zenofocus/dist" ]; then
        echo "❌ ERROR: dist folder not found! Build may have failed."
        exit 1
    fi
    
    # Verify backend/server.js exists
    if [ ! -f "/var/www/zenofocus/backend/server.js" ]; then
        echo "❌ ERROR: backend/server.js not found!"
        exit 1
    fi
    
    # Create logs directory for PM2
    mkdir -p /var/www/zenofocus/logs
    
    # Ensure PM2 uses the correct Node version
    # Reinstall PM2 with current Node to ensure compatibility
    echo "   Ensuring PM2 uses correct Node version..."
    npm install -g pm2
    
    # Start with ecosystem.config.js if it exists
    cd /var/www/zenofocus
    if [ -f "ecosystem.config.js" ]; then
        echo "   Using ecosystem.config.js for PM2..."
        pm2 delete zenofocus 2>/dev/null || true
        pm2 start ecosystem.config.js
    else
        # Fallback: start directly with environment variable
        echo "   Starting with PM2 directly..."
        export PORT=3001
        pm2 start npm --name "zenofocus" --cwd /var/www/zenofocus -- start --update-env
    fi
    pm2 save
    
    # Configure Nginx
    echo "⚙️ Configuring Nginx..."
    NGINX_CONFIG="/etc/nginx/sites-available/zenofocus"
    
    # Determine server name (DOMAIN and SERVER_IP are passed from parent script)
    if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "" ]; then
        SERVER_NAME="$DOMAIN"
        echo "   Using domain: $DOMAIN"
    else
        SERVER_NAME="$SERVER_IP"
        echo "   Using IP address: $SERVER_IP"
    fi
    
    # Create Nginx configuration
    # Use a different delimiter to avoid conflict with outer heredoc
    cat > "$NGINX_CONFIG" << 'NGINXCONFIG'
server {
    listen 80;
    server_name SERVER_NAME_PLACEHOLDER;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    # HTTPS server on port 443
    listen 443 ssl http2;
    server_name SERVER_NAME_PLACEHOLDER;
    
    # SSL configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/SERVER_NAME_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/SERVER_NAME_PLACEHOLDER/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy settings
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Increase timeouts for long-running requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
NGINXCONFIG
    
    # Replace placeholder with actual server name
    sed -i "s/SERVER_NAME_PLACEHOLDER/$SERVER_NAME/g" "$NGINX_CONFIG"
    
    # Enable site
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # Test Nginx configuration
    nginx -t
    
    # Get SSL certificate if domain is provided
    if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "" ]; then
        echo "🔐 Obtaining SSL certificate for $DOMAIN..."
        # Stop Nginx temporarily for certbot
        systemctl stop nginx 2>/dev/null || true
        
        # Get certificate (non-interactive)
        certbot certonly --standalone \
            --non-interactive \
            --agree-tos \
            --email "admin@$DOMAIN" \
            -d "$DOMAIN" \
            --preferred-challenges http || {
            echo "⚠️ Warning: Could not obtain SSL certificate automatically."
            echo "   You may need to run: certbot --nginx -d $DOMAIN"
        }
        
        # Start Nginx
        systemctl start nginx
    else
        echo "⚠️ No domain specified. Skipping SSL certificate setup."
        echo "   For HTTPS with IP address, you'll need to use a self-signed certificate or configure manually."
        # Create a basic HTTP-only config for IP
        cat > "$NGINX_CONFIG" << 'NGINXIPCONFIG'
server {
    listen 80;
    server_name SERVER_IP_PLACEHOLDER;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXIPCONFIG
        sed -i "s/SERVER_IP_PLACEHOLDER/$SERVER_IP/g" "$NGINX_CONFIG"
        ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
        nginx -t
    fi
    
    # Reload Nginx
    systemctl reload nginx || systemctl restart nginx
    systemctl enable nginx
    
    # Check status
    sleep 3
    pm2 list
    pm2 logs zenofocus --lines 30 --nostream
    
    # Show any errors
    echo ""
    echo "📊 Checking process status..."
    pm2 describe zenofocus
EOF

echo "✅ Deployment complete!"
if [ -n "$DOMAIN" ]; then
    echo "🌐 Your app is available at: https://$DOMAIN"
    echo "   (HTTP requests will be automatically redirected to HTTPS)"
else
    echo "🌐 Your app is available at: http://$SERVER_IP"
    echo "   (To enable HTTPS, set DOMAIN variable in deploy.sh)"
fi
echo ""
echo "👉 NOTE: If you still can't access the site, check your VPS provider's Firewall/Security Group settings"
echo "   and ensure Port 80 (HTTP) and Port 443 (HTTPS) are open."
echo ""
echo "📋 Useful commands on server:"
echo "   - Check Nginx status: systemctl status nginx"
echo "   - Check PM2 status: pm2 list"
echo "   - View app logs: pm2 logs zenofocus"
echo "   - Renew SSL (if using domain): certbot renew"
