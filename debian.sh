#!/bin/bash

DOMINIO="$1"
echo "Nome do Dominio: $DOMINIO"
echo $DOMINIO > /etc/hostname
echo "127.0.1.2  $DOMINIO" >> /etc/hosts
echo $DOMINIO > /etc/mailname
hostname $DOMINIO
hostnamectl set-hostname $DOMINIO
apt-get install software-properties-common -y
apt-get update
apt install bind9 bind9utils bind9-doc  -y
systemctl restart bind9
apt-get install zip unzip  -y
apt-get install apache2  -y
service apache2 restart
DEBIAN_FRONTEND=noninteractive apt-get install postfix  -y
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'internet sites'"
debconf-set-selections <<< "postfix postfix/mailname string $DOMINIO"
mkdir -p /etc/configs/ssl/new/
openssl genrsa -des3 --passout pass:1111 -out certificado.key 2048
openssl req -new -passin pass:1111 -key certificado.key -subj "/C=GB/ST=London/L=London/O=Endurance Control Panel/OU=IT Department/CN=$DOMINIO"  -out certificado.csr
openssl x509 -req --passin  pass:1111 -days 365 -in certificado.csr -signkey certificado.key -out certificado.cer
openssl rsa --passin pass:1111  -in certificado.key -out certificado.key.nopass
mv -f certificado.key.nopass certificado.key
openssl req -new -x509 -extensions v3_ca -passout pass:1111 -subj "/C=GB/ST=London/L=London/O=Endurance Control Panel/OU=IT Department/CN=$DOMINIO"  -keyout cakey.pem -out cacert.pem -days 3650
chmod 600 certificado.key
chmod 600 cakey.pem
mv certificado.key /etc/configs/ssl/new
mv certificado.cer /etc/configs/ssl/new
mv cakey.pem /etc/configs/ssl/new
mv cacert.pem /etc/configs/ssl/new
postconf -e myhostname=$DOMINIO
postconf -e 'smtpd_tls_key_file = /etc/configs/ssl/new/certificado.key'
postconf -e 'smtpd_tls_cert_file = /etc/configs/ssl/new/certificado.cer'
postconf -e 'smtpd_tls_CAfile = /etc/configs/ssl/new/cacert.pem'
postconf -e 'queue_run_delay = 200s'
postconf -e 'minimal_backoff_time = 300s'
postconf -e 'maximal_backoff_time = 600s'
postconf -e 'maximal_queue_lifetime = 600s'
postconf -e 'bounce_queue_lifetime = 600s'
postconf -e smtpd_use_tls=yes
apt-get install mutt  -y
apt install mailutils  -y
apt install nodejs npm -y
openssl genrsa -out dkim_private.pem 2048
openssl rsa -in dkim_private.pem -pubout -outform der 2>/dev/null | openssl base64 -A > dkim_public.txt
apt-get install git -y 
git clone https://github.com/sendemailnodes/envio.git  && cd envio && npm i
node dns.js
/etc/init.d/apache2 restart
/etc/init.d/postfix restart
history -c
echo "INSTALAÇÂO CONCLUIDA"
