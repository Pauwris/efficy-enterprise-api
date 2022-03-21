# Efficy Enterprise API

## Introduction

The Efficy Enterprise API is developed for server-side usage in a [Node.js](https://nodejs.org/en/) environment (e.g. for integrations) and also bundled for usage inside an Efficy browser session for client-side JSON RPC requests.

Inside [Node.js](https://nodejs.org/en/)
```javascript
import { CrmEnv, CrmRpc} from "./lib/index.mjs";

const crm = new CrmRpc(crmEnv); // See CrmEnv class
const compSearch = crm.search("comp", "SEARCHFAST", "Efficy");
await crm.executeBatch();

// Debug output
compSearch.items; // An array of row items
```

Inside your Efficy Enterprise, running in the browser
```javascript
const {CrmRpc} = await import('../../../shared/js/projutils/efficy-enterprise-api-browser-es.js');
const crm = new CrmRpc();

const proposal = crm.openEditObject("docu", 0);
proposal.updateFields({
	"NAME": "Non committed proposal",
	"MEMO": "Line1\nLine2"
});
proposal.insertDetail("Oppo", Model("key"));
proposal.insertDetail("Comp", Model("K_COMPANY"));
proposal.insertDetail("Cont", Model("K_CONTACT"));
await crm.executeBatch();

// Debug output
proposal.edithandle; // The editHandle number, can be used to open an edit page
```

## Get started

Consult the [github-pages](https://pauwris.github.io/efficy-enterprise-api/) documentation