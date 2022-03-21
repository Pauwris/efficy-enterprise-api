# Efficy Enterprise API

## Introduction

The Efficy Enterprise API is developed for usage in a Node.js environment (e.g. for integrations) or for usage inside an Efficy browser session for client-side JSON RPC requests.

The Efficy Enterprise API is developed with Visual Studio Code and [Node.js](https://nodejs.org/en/) v16.13.2

## Server-side usage in Node.js

Warning: [Node.js](https://nodejs.org/en/) is not to be confused with Efficy /node scripts.

### CRM environment
Initiate the Crm environment, using User/Pwd credentials or by using an API key (recommended)
```js
const crmEnv = new CrmEnv({
	"url": "http://efficy120/",
	"customer": "efficy120",
	"apiKey": "86E353284C0C4A848F7ADEA13589C8B6",
	"logOff": false,
	"user": "",
	"pwd": ""
});
```

### Example: Create a document
```js
const crm = new CrmRpc(crmEnv, logger);

const docu = crm.openEditObject("docu", 0);
docu.updateField("NAME", "Hello from Node.js");
docu.insertDetail("Comp", 2);
docu.insertDetail("Cont", 44395, true, true);
docu.commitChanges();
docu.activateCategory("DOCU$INVOICING");
docu.updateCategoryFields("DOCU$INVOICING", {
	"D_INVOICE":"2021-01-08T00:00:00",
	"COMMUNICATION": "Hello World!"
});
docu.updateCategoryField("DOCU$INVOICING", "PRE_PAID", 123.456)
docu.clearDetail("Comp");
docu.insertDetail("Comp", 4);
docu.insertDetail("Cont", 50512, false);
docu.insertDetail("Prod", 4);
docu.updateDetail("Prod", 0, {
	QUANTITY: 5
});
docu.setUsers([169, 170], true);
docu.setUserSecurity(99999002, 271);
docu.setReference(99999001);
docu.commitChanges();
docu.closeContext();
await crm.executeBatch();
```

### Example: Execute various kind of queries and searches
```js
const tags = crm.executeDatabaseQuery(99990034); // query "Standard: Top company tags"
const contDupls = crm.executeSystemQuery(4, 1, [11000,2]); // System query "Own Duplicate List"
const appos = crm.executeSqlQuery("Select * from ACTIONS where PLANNED=:p1 and DONE=:p2", ["1", "0"], true, 2);

const compSearch = crm.search("comp", "SEARCHFAST", "Efficy");
const contactsByEmail = crm.searchContactsByEmail(["john.doe@efficy.com", "john.doe@outlook.com"]);
const contactsByPhone = crm.searchContactsByPhone("+32 470 00 00 00");

await crm.executeBatch();
```

## Client-side usage in an Efficy session

### Example: Edit new, without commit

Create a new Proposal document, linked to the current Opportunity and the main contact and company. The name field is initialized. Instead of committing the changes, the available editHandle after `await crm.executeBatch()` is used to open a dialog edit page.

```js
define([
	'standard/commands/consultToolsCmd',
	'model',
	'browser',
	'url',
	'windowManager',
	'custom/../../../shared/js/projutils/extendCommand'
], function (StandardCommands, Model, Browser, Url, WindowManager, extendCommand) {

	async function editNewProposal() {
		const {CrmRpc} = await import('../../../shared/js/projutils/efficy-enterprise-api-browser-es.js');
		const crm = new CrmRpc();

		const proposal = crm.openEditObject("docu", 0);
		proposal.updateFields({
			"NAME": "Non committed proposal"
		});
		proposal.insertDetail("Oppo", Model("key"));
		Model("K_COMPANY") && proposal.insertDetail("Comp", Model("K_COMPANY"));
		Model("K_CONTACT") && proposal.insertDetail("Cont", Model("K_CONTACT"));
		await crm.executeBatch();

		var url = `edit?page=edit/edit&entity=docu&bookmark=${Model("bookmark")}&edithandle=${proposal.edithandle}`,
			options = {url: url, width: 640, height: 640, name: 'edit_docu'};

		WindowManager.open('dialog', options);
	}

	function callAsyncFn(fn) {
		fn().then(output => {
			// Optionally refresh current page
			Browser.navigate(Url.setArguments( {'nocache': 't'}));
		}).catch(errorObj => {
			alert(errorObj.toString());
		})
	}

	return extendCommand(StandardCommands, {
		"editNewProposal": callAsyncFn.bind(this, editNewProposal),
	})
});
```