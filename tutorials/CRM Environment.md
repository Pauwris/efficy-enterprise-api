For [Node.js](https://nodejs.dev/) only, setup your [CrmEnv](/docs/CrmEnv.html) (CRM Environment) parameters. The recommended authentication kind is with an API key. Another possibility is passing `user` and `pwd` credentials.

```javascript
const crmEnv = new CrmEnv({
	"url": "http://efficy120/",
	"customer": "efficy120",
	"apiKey": "86E353284C0C4A848F7ADEA13589C8B6",
	"logOff": false,
	"user": "",
	"pwd": ""
});
```
Don't use [CrmEnv](/docs/CrmEnv.html) in a client-side an Efficy session