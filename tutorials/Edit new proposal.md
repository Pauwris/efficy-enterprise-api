Demonstrates a client-side integration inside an Efficy session.

This tutorial creates a new Proposal document, linked to the current Opportunity and the main contact and company. The name field is initialized. Instead of committing the changes, the available editHandle after `await crm.executeBatch()` is used to open a dialog edit page.

```javascript
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

MacroConsultCustom.txt
```html
ConsultCmdsTools.Oppo {[CmdEditNewProposal]}
CmdEditNewProposal {[<%Macro(name=$macro$, $_more$=$more$, $icon$="i-Docu", $caption$="Edit new Proposal", $msg$="editNewProposal")%>]}
```
