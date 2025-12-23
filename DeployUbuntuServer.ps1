
npm run build


tar -czvf dist.tar.gz dist


scp dist.tar.gz administrator@172.30.10.120:/var/www/CE_TEMPERATURE_CHECKLIST_WEBSITE/


ssh administrator@172.30.10.120 "
  cd /var/www/CE_TEMPERATURE_CHECKLIST_WEBSITE &&
  rm -rf assets images index.html vite.svg &&
  tar -xzvf dist.tar.gz &&
  mv dist/* . &&
  rmdir dist &&
  rm dist.tar.gz
"


