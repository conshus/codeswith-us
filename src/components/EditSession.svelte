<script>
    import { user, sessions } from "../stores";
    import SessionForm from './SessionForm.svelte';
    let selectedSession = {}
    function selectSession(session){
        console.log("selectSession: ",session);
        selectedSession = structuredClone(session);
    }
</script>

<main>
    {#if $sessions.length === 0}
        <h1>No sessions</h1>
    {:else}
        {#if selectedSession.title}
            <h1>Edit session</h1>
            <button on:click={() => selectedSession = {}}>back</button>
            <SessionForm {selectedSession} />
        {:else}
            <h1>Select a session</h1>
            <fieldset>
                <legend>sessions</legend>
                <div id="session-container">
                    {#each $sessions as session (session.slug)}
                        <div class="session-div">
                            <div>
                                <time datetime="{session.datetime}">{session.datetime}</time>
                            </div>
                            <p>
                                {session.title} 
                            </p>
                            <div>
                                <button on:click={() => selectSession(session)}>select</button>
                            </div>
                        </div>
                    {/each}
                </div>
            </fieldset>
        {/if}
    {/if}
</main>

<style>
    * {
        box-sizing: border-box;
        margin: 0;
    }

    fieldset {
        width: 100%;
        max-width: 500px;
        margin: auto;
    }
    legend {
        background-color: #000;
        color: #fff;
        padding: 3px 6px;
        text-align: center;
    }
    #session-container {
        height: 30vh;
        overflow-y: auto;
    }
    .session-div {
        display: flex;
        justify-content: space-between;
        padding: 5px;
        border: 1px solid black;
        margin: 5px 0;
        width: 100%;
    }

    p {
        /* max-width: 290px; */
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

</style>