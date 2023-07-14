<script>
    import { user, sessions } from "../stores";
    import Canvas from "./Canvas.svelte";

    let title;
    let datetime;
    let timeInMs;
    let hosts = [];
    let userToAdd = {};
    userToAdd.host = {};
    userToAdd.guest = {};
    let guests = [];
    let prereqs = [];
    let prereqToAdd = {};
    let resources = [];
    let resourceToAdd = {};
    let applicationId = "";
    let conversationId = "";
    let sessionId = "";
    let githubRepo;
    let githubRepoPreview;
    let state = "";
    let isGeneratingCreds = false;
    let selectedWorkspace;
    let codesandboxDialog;
    let stackblitzDialog;
    let sessionImageURL="";

    let workspaceURL;

    let canvas;

    $: slug = title && title.toLowerCase().replaceAll(' ','-').replaceAll("'",'');
    $: slugDuplicate = $sessions?.find(session => session.slug === slug);
    $: workspaceURL = githubRepoPreview;
    $: allowSubmit = title && datetime && !slugDuplicate && hosts && applicationId && conversationId && sessionId && githubRepo && workspaceURL;

    // Example POST method implementation:
    async function postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + $user.token.access_token
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }

    // Timezone stuff
    function handleDateTimeChange() {
        const timezoneHr = Math.trunc(-(new Date().getTimezoneOffset() / 60));
        const sign = timezoneHr < 0 ? "-" : "+";
        const timezoneMin = new Date().getTimezoneOffset() % 60;
        const timezoneString = `${sign}${
        Math.abs(timezoneHr) < 10 ? "0" + Math.abs(timezoneHr) : Math.abs(timezoneHr)
        }${timezoneMin === 0 ? "00" : Math.abs(timezoneMin)}`;
        const newDate = new Date(`${datetime}${timezoneString}`);
        timeInMs = Date.parse(newDate);
        console.log("timeInMs: ", timeInMs);
        const datetimeSplit = datetime.split('T')[0].split('-')
        // yearMonth = `${datetimeSplit[0]}-${datetimeSplit[1]}`;
    }

    async function addUser(type) {
        console.log("hosts: ", hosts);
        console.log(`${type}: `, userToAdd[type]);
        userToAdd[type].github = userToAdd[type].github.replaceAll('@','');
        userToAdd[type].twitter = userToAdd[type].twitter ? userToAdd[type].twitter.replaceAll('@','') : '';
        // if (userToAdd[type].twitter){

        // }
        // get profile image from GitHub and add to object
        state = `getting ${type} GitHub profile picture...`;
        try {
            const githubResponse = await fetch(`https://api.github.com/users/${userToAdd[type].github}`);
            const githubData = await githubResponse.json();
            console.log(githubData);
            userToAdd[type].avatar_url = githubData.avatar_url;
            console.log(`${type}: `, userToAdd[type]);
            state = `adding ${type}...`
            if (type === "host"){
                hosts = [...hosts, userToAdd[type]];
            } else if (type === "guest"){
                guests = [...guests, userToAdd[type]];
            }
            state = "";
            userToAdd[type] = {};

            console.log('hosts: ', hosts);
            console.log('guests: ', guests);

        } catch (error) {
            console.error('Error getting GitHub info: ', error);
            state = error;
        }

    }

    function removeUser(type, index){
        console.log("removeUser: ", type, index);
        if (type === "host"){
            // hosts = [...hosts.splice(index, 1)];
            hosts.splice(index, 1);
            hosts = hosts;
            console.log("new hosts: ", hosts);
        } else if (type === "guest") {
            // guests = [...guests.splice(index, 1)];
            guests.splice(index, 1);
            guests = guests;
            console.log("new guests: ", guests);
        }
    }

    async function generateCredentials() {
        console.log("generateCredentials");
        try {
            state = "Generating credentials..."
            isGeneratingCreds = true;
            const credsJSON = await postData(`/.netlify/functions/generate_creds`);
            console.log("credsJSON: ", credsJSON);
            applicationId = credsJSON.applicationId;
            conversationId = credsJSON.conversationId;
            sessionId = credsJSON.sessionId;

            state = "Generated credentials successfully.";
            setTimeout(() => {
                state = "";
                isGeneratingCreds = false;
            }, 1000);
            
        } catch (error){
            console.error('Error generating credentials: ', error);
            state = error;
            isGeneratingCreds = false;
        }

    }

    async function createSession() {
        sessionImageURL = await canvas.saveImage();
        console.log("sessionImageURL: ", sessionImageURL);
        const sessionToAdd = {
            title,
            slug,
            datetime,
            hosts,
            guests,
            conversationId,
            applicationId,
            sessionId,
            githubRepo,
            sessionImageURL,
            workspaceURL
        }

        console.log("sessionToAdd: ", sessionToAdd);

    }

    function previewGitHubRepo() {
        console.log("selectedWorkspace: ", selectedWorkspace);
        console.log("github preview: ", `https://stackblitz.com/${githubRepo.replaceAll('.com','').replaceAll('https://','')}`);
        switch (selectedWorkspace){
            case 'codesandbox':
                githubRepoPreview = `${githubRepo.replaceAll('github','githubbox')}`;
                // githubRepoPreview = `https://stackblitz.com/${githubRepo.replaceAll('.com','').replaceAll('https://','')}`;
                break;
            case 'stackblitz':
                githubRepoPreview = `https://stackblitz.com/${githubRepo.replaceAll('.com','').replaceAll('https://','')}`;
                break;

        }
        // githubRepoPreview = `https://stackblitz.com/${githubRepo.replaceAll('.com','').replaceAll('https://','')}`
    }

    function addPrereq() {
        prereqs = [...prereqs, prereqToAdd];
        prereqToAdd = {};
    }

    function removePrereq(index) {
        console.log("removePrereq: ", index);
        prereqs.splice(index, 1);
        prereqs = prereqs;
        console.log("prereqs: ", prereqs);
    }

    function addResource() {
        resources = [...resources, resourceToAdd];
        resourceToAdd = {};
    }

    function removeResource(index) {
        console.log("removeResource: ", index);
        resources.splice(index, 1);
        resources = resources;
        console.log("resources: ", resources);
    }

</script>

<h1>Create session</h1>
<dialog  bind:this={codesandboxDialog}>
    <p>Run your project in a cloud enviroment with publically accessible URLs! Learn more about CodeSandbox at <a href="https://codesandbox.io" target="_blank">https://codesandbox.io</p>
    <form method="dialog">
      <button>OK</button>
    </form>
</dialog>
<dialog  bind:this={stackblitzDialog}>
    <p>Run your project completely inside your browser! Learn more about StackBlitz at <a href="https://stackblitz.com" target="_blank">https://stackblitz.com</a></p>
    <form method="dialog">
      <button>OK</button>
    </form>
</dialog>
<details>
    <summary>Title</summary>
    <input bind:value={title} id="title" required placeholder="Enter Session Title">
    <br/><br/>
    <label for="slug">Slug:</label>
    <input bind:value={slug} id="slug" disabled required>
    <br/>
    {slugDuplicate ? "event name needs to be unique":""}
</details>
<details>
    <summary>Date and Time</summary>
    <input type="datetime-local" bind:value={datetime} on:change={handleDateTimeChange} id="datetime" required>
</details>
<details>
    <summary>Generate Credentials</summary>
    <div class="flex-columns">
        <div class="left column"><button on:click={generateCredentials} disabled={isGeneratingCreds}>{isGeneratingCreds ? "Generating": "Generate" }</button></div>
        <div class="right column">
            <div>
                <b>ApplicationID: </b> {applicationId}
                <br/><b>ConversationID: </b> {conversationId}
                <br/><b>SessionID: </b> {sessionId}
            </div>
        </div>
    </div>
</details>
<details>
    <summary>Host(s)</summary>
    <div class="flex-columns">
        <div class="left column">
            <input bind:value={userToAdd.host.name} placeholder="Enter Name"/>
            <br/>
            <input bind:value={userToAdd.host.github} placeholder="Enter GitHub Username"/>
            <br/>
            <input bind:value={userToAdd.host.twitter} placeholder="Enter Twitter Username"/>
            <br/><br/>
            <button on:click={() => addUser('host')} disabled={!userToAdd.host.name || !userToAdd.host.github } name="add-host">Add host</button>
        </div>
        <div class="right column">
            {#each hosts as host, i (i)}
                <div class="user">
                    <div>
                        <img src={host.avatar_url} alt={host.name + "GitHub profile image"}/>
                    </div>
                    <div>
                        {host.name}
                        <br/><a href={"https://github.com/"+ host.github} target="_blank">GitHub</a>
                        {#if host.twitter !== '' }
                            <br/><a href={"https://twitter.com/"+ host.twitter} target="_blank">Twitter</a>
                        {/if}                        
                    </div>
                    <div>
                        <button on:click={() => removeUser('host', i)}>x</button>
                    </div>                    
                </div>
            {/each}
        </div>
    </div>
</details>
<details>
    <summary>Guest(s)</summary>
    <div class="flex-columns">
        <div class="left column">
            <input bind:value={userToAdd.guest.name} placeholder="Enter Name"/>
            <br/>
            <input bind:value={userToAdd.guest.github} placeholder="Enter GitHub Username"/>
            <br/>
            <input bind:value={userToAdd.guest.twitter} placeholder="Enter Twitter Username"/>
            <br/><br/>
            <button on:click={() => addUser('guest')} disabled={!userToAdd.guest.name || !userToAdd.guest.github } name="add-guest">Add guest</button>
        </div>
        <div class="right column">
            {#each guests as guest, i (i)}
                <div class="user">
                    <div>
                        <img src={guest.avatar_url} alt={guest.name + "GitHub profile image"}/>
                    </div>
                    <div>
                        {guest.name}
                        <br/><a href={"https://github.com/"+ guest.github} target="_blank">GitHub</a>
                        {#if guest.twitter !== '' }
                            <br/><a href={"https://twitter.com/"+ guest.twitter} target="_blank">Twitter</a>
                        {/if}                        
                    </div>
                    <div>
                        <button on:click={() => removeUser('guest', i)}>x</button>
                    </div>                    
                </div>
            {/each}
        </div>
    </div>
</details>
<details>
    <summary>GitHub Repo</summary>
    <div class="flex-columns">
        <div class="left column">
            <input type="url" bind:value={githubRepo} placeholder="Enter GitHub Repo URL"/>
            <fieldset>
                <legend>Select a workspace:</legend>
            
                <div>
                    <input type="radio" bind:group={selectedWorkspace} id="codesandbox" name="workspace" value="codesandbox">
                    <label for="codesandbox">CodeSandbox</label>
                    <button on:click={() => codesandboxDialog.showModal()}>more info</button>
                </div>
                <div>
                    <input type="radio" bind:group={selectedWorkspace} id="stackblitz" name="workspace" value="stackblitz">
                    <label for="stackblitz">StackBlitz</label>
                    <button on:click={() => stackblitzDialog.showModal()}>more info</button>
                  </div>
              
              </fieldset>
            
            <button on:click={previewGitHubRepo} disabled={!selectedWorkspace | !githubRepo}>Get Preview</button>
        </div>
        <div class="right column">
            {#if githubRepoPreview}
                Preview: <a href={githubRepoPreview} target="_blank">{githubRepoPreview}</a>
            {/if}
        </div>
    </div>
</details>
<details>
    <summary>Prerequisite(s)</summary>
    <div class="flex-columns">
        <div class="left column">
            <input bind:value={prereqToAdd.instruction} placeholder="Enter Instruction"/>
            <br/>
            <input bind:value={prereqToAdd.link} placeholder="Enter Link"/>
            <br/>
            <input bind:value={prereqToAdd.text} placeholder="Enter Link Text"/>
            <br/><br/>
            <button on:click={ addPrereq } disabled={!prereqToAdd.instruction || !prereqToAdd.link || !prereqToAdd.text } name="add-prereq">Add Prerequisite</button>
        </div>
        <div class="right column">
            <div>
                {#each prereqs as prereq, i (i)}
                    <ul>
                        <li>
                            {prereq.instruction} - <a href={prereq.link} target="_blank">{prereq.text}</a>
                            <button on:click={() => removePrereq(i)}>x</button>
                        </li>
                    </ul>
                {/each}
            </div>
        </div>
    </div>
</details>
<details>
    <summary>Resource(s)</summary>
    <div class="flex-columns">
        <div class="left column">
            <input bind:value={resourceToAdd.link} placeholder="Enter Link"/>
            <br/>
            <input bind:value={resourceToAdd.text} placeholder="Enter Link Text"/>
            <br/><br/>
            <button on:click={ addResource } disabled={ !resourceToAdd.link || !resourceToAdd.text } name="add-resource">Add Resource</button>
        </div>
        <div class="right column">
            <div>
                {#each resources as resource, i (i)}
                    <ul>
                        <li>
                            <a href={resource.link} target="_blank">{resource.text}</a>
                            <button on:click={() => removeResource(i)}>x</button>
                        </li>
                    </ul>
                {/each}
            </div>
        </div>
    </div>
</details>
<details>
    <summary>Session Image</summary>
    <Canvas bind:this={canvas} {slug} {title} {hosts} {guests}/>
</details>
<br/>
<button on:click={createSession} disabled={!allowSubmit} name="add-session">Create Session</button>
<br/>
<div id="state">{state}</div>



<style>
    details {
        border: 1px solid #aaa;
        border-radius: 4px;
        padding: 0.5em 0.5em 0;
    }

    summary {
        font-weight: bold;
        margin: -0.5em -0.5em 0;
        padding: 0.5em;
    }

    details[open] {
        padding: 0.5em;
    }

    details[open] summary {
        border-bottom: 1px solid #aaa;
        margin-bottom: 0.5em;
    }
    .flex-columns {
        display: flex;
    }
    .column {
        padding: 5px;
    }

    .right.column {
        border-left: 1px black solid;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
    }
    .user {
        display: flex;
        border: 1px black solid;
        margin: 5px;
        padding: 2px;
    }
    .user img {
        width: 50px;
    }

    .user div {
        margin: 2px;
    }

</style>