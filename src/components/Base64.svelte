<script>
    let base64;
    let keyText;
    let buttonText = "copy to clipboard";

    function handleFiles(event) {
        console.log("handleFiles event: ", event);
        const fileList = event.target.files;
        // const numFiles = fileList.length;
        const reader = new FileReader();
        reader.onload = (e) => {
            // callback(e.target.result.split(";base64,")[1]);
            base64 = e.target.result.split(";base64,")[1];
        };
        reader.readAsDataURL(fileList[0]);
    }

    function copyToClipboard() {
        console.log("copyToClipboard");
        keyText.select();
        document.execCommand("copy");
        buttonText = "copied to clipboard";
        setTimeout(() => {
            buttonText = "copy to clipboard";
        }, 1000);
    }

</script>

<div>
    Choose the private key downloaded from Vonage Dashboard.
    <br/><br/>
    <input type="file" id="private-key-input" on:change={handleFiles} />
    <br/><textarea id="key-textarea" bind:this={keyText} bind:value={base64} placeholder="VONAGE_PRIVATE_KEY64 will show up here." rows="15" cols="30" disabled></textarea>
    <br/><button id="copy-button" on:click={copyToClipboard}>{buttonText}</button>
</div>

<style>
    div {
        text-align: center;
    }
</style>