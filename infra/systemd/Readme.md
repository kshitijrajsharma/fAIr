### Systemd templates


Services required to setup fAIr in VM ( Dev env ).

if frontend is hosted with nginx : 

```bash
sudo systemctl restart gunicorn && sudo systemctl restart workers && sudo nginx -t && sudo systemctl restart nginx && sudo systemctl restart django-q
```