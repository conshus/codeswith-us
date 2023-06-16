<script>
    import CreateSession from './CreateSession.svelte';
    import EditSession from './EditSession.svelte';
    import Base64 from './Base64.svelte';
    let mode = "create";

</script>

<main>
    Dashboard
    <br/><br/>
    <button on:click={() => mode = "create"} disabled={mode === "create"}>create a session</button>
     | <button on:click={() => mode = "edit"} disabled={mode === "edit"}>edit a session</button>
     | <button on:click={() => mode = "base64"} disabled={mode === "base64"}>Get Private Key Base64</button>
    <hr />
    {#if mode === "create"}
        <CreateSession />
    {:else if mode === "edit"}
        <EditSession />
    {:else if mode === "base64"}
        <Base64 />
    {/if}
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
        max-width: 1000px;
        margin: auto;
        padding: 10px;
        box-sizing: border-box;
    }
</style>