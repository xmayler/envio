#!/bin/bash

DOMINIO="$1"
echo "Nome do Dominio: $DOMINIO"
echo $DOMINIO > /etc/hostname
echo "127.0.1.2  $DOMINIO" >> /etc/hosts
echo $DOMINIO > /etc/mailname
sudo hostname $DOMINIO
sudo hostnamectl set-hostname $DOMINIO
sudo apt-get install software-properties-common
sudo apt-get update
sudo apt install bind9 bind9utils bind9-doc  -y
sudo systemctl restart bind9
sudo apt-get install zip unzip  -y
sudo apt-get install apache2  -y
sudo service apache2 restart
sudo DEBIAN_FRONTEND=noninteractive apt-get install postfix  -y
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'internet sites'"
debconf-set-selections <<< "postfix postfix/mailname string $DOMINIO"
sudo mkdir -p /etc/configs/ssl/new/
sudo openssl genrsa -des3 --passout pass:1111 -out certificado.key 2048
sudo openssl req -new -passin pass:1111 -key certificado.key -subj "/C=GB/ST=London/L=London/O=Endurance Control Panel/OU=IT Department/CN=$DOMINIO"  -out certificado.csr
sudo openssl x509 -req --passin  pass:1111 -days 365 -in certificado.csr -signkey certificado.key -out certificado.cer
sudo openssl rsa --passin pass:1111  -in certificado.key -out certificado.key.nopass
sudo mv -f certificado.key.nopass certificado.key
sudo openssl req -new -x509 -extensions v3_ca -passout pass:1111 -subj "/C=GB/ST=London/L=London/O=Endurance Control Panel/OU=IT Department/CN=$DOMINIO"  -keyout cakey.pem -out cacert.pem -days 3650
sudo chmod 600 certificado.key
sudo chmod 600 cakey.pem
sudo mv certificado.key /etc/configs/ssl/new
sudo mv certificado.cer /etc/configs/ssl/new
sudo mv cakey.pem /etc/configs/ssl/new
sudo mv cacert.pem /etc/configs/ssl/new
sudo postconf -e 'smtpd_tls_key_file = /etc/configs/ssl/new/certificado.key'
sudo postconf -e 'smtpd_tls_cert_file = /etc/configs/ssl/new/certificado.cer'
sudo postconf -e 'smtpd_tls_CAfile = /etc/configs/ssl/new/cacert.pem'
sudo postconf -e 'queue_run_delay = 200s'
sudo postconf -e 'minimal_backoff_time = 300s'
sudo postconf -e 'maximal_backoff_time = 600s'
sudo postconf -e 'maximal_queue_lifetime = 600s'
sudo postconf -e 'bounce_queue_lifetime = 600s'
sudo postconf -e smtpd_use_tls=yes
sudo apt-get install mutt  -y
sudo apt install mailutils  -y
sudo apt install nodejs npm -y
openssl genrsa -out dkim_private.pem 2048
openssl rsa -in dkim_private.pem -pubout -outform der 2>/dev/null | openssl base64 -A > dkim_public.txt
sudo apt-get install git -y 
git clone https://github.com/sendemailnodes/envio.git  && cd envio && npm i
node dns.js
sudo /etc/init.d/apache2 restart
sudo /etc/init.d/postfix restart
history -c
echo "INSTALAÇÂO CONCLUIDA"
