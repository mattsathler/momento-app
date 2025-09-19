#!/bin/bash
echo "=========================="
echo "Iniciando Deploy MomentoApp"
echo "=========================="

ssh -i momento.pem ubuntu@xxxxxxx.sa-east-1.compute.amazonaws.com "
  cd momento-app &&
  git checkout master &&
  git pull origin master &&
  npm ci &&
  pm2 reload ecosystem.config.js
"

echo "=========================="
echo "Deploy finalizado!"
echo "=========================="