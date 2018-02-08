# consul-to-env
Download config from consul and store locally in a .env file

## Example of use (module installed globally)
```
consul-to-env -u 'user:pass' -b 'https://consul.example.com/v1/kv/' -c 'config/app/' -o env
```

## Example of use (module only locally)
```
npx -p . consul-to-env -u 'user:pass' -b 'https://consul.example.com/v1/kv/' -c 'config/app/' -o env
```
or
```
node index.js -u 'user:pass' -b 'https://consul.example.com/v1/kv/' -c 'config/app/' -o env
```
