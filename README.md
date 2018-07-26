# amq.rabbitmq.reply-to.js
Direct reply-to is a feature that allows RPC (request/reply) clients with a design similar to that demonstrated in tutorial 6 (https://www.rabbitmq.com/direct-reply-to.html) to avoid declaring a response queue per request.


## bashwin 1:
```
tsc -w
```
## bashwin 2:
```
./node_modules/.bin/onchange "./lib/**/*.js" -- node ./spec/runjasmine.js
```

## bashwin 3:
```
reload -d ./spec/results report.html
```


http://localhost:8080/report.html

