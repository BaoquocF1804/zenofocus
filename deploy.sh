#!/bin/bash

# Configuration
SERVER_IP="207.148.79.36"
SERVER_USER="root"
REMOTE_PATH="/var/www/zenofocus"

echo "🚀 Starting deployment to $SERVER_IP..."

# Step 1: Create remote directory
echo "📂 Creating remote directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_PATH"

# Step 2: Sync files
echo "cw Syncing files (this may take a while)..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' ./ $SERVER_USER@$SERVER_IP:$REMOTE_PATH

# Step 3: Remote setup and build
echo "hammer_and_wrench Building and starting application on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
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

    # Firewall setup
    echo "🛡️ Configuring firewall..."
    if command -v ufw > /dev/null; then
        echo "   Found UFW. Allowing port 80 and 22..."
        ufw allow 80/tcp
        ufw allow 22/tcp
    else
        echo "⚠️ UFW not found. If you have another firewall (like iptables), please open port 80."
    fi

    # Start/Restart with PM2
    echo "🚀 Starting application..."
    if ! command -v pm2 &> /dev/null; then
        echo "⚠️ PM2 not found. Installing PM2..."
        npm install -g pm2
    fi

    # Delete existing process to ensure clean slate with new Node version
    pm2 delete zenofocus 2>/dev/null || true
    
    # Start new process
    PORT=80 pm2 start npm --name "zenofocus" -- start
    pm2 save
    
    # Check status
    sleep 2
    pm2 list
    pm2 logs zenofocus --lines 20 --nostream
EOF

echo "✅ Deployment complete!"
echo "👉 NOTE: If you still can't access the site, check your VPS provider's Firewall/Security Group settings (e.g., AWS Security Groups, Vultr Firewall, DigitalOcean Firewalls) and ensure Port 80 (HTTP) is open."
echo "Check your app at http://$SERVER_IP"
