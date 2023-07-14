<script>
    import { afterUpdate, onMount } from "svelte";
    import { user } from "../stores";

    let w;
    let canvas;
    let dataURL;
    let blobData;

    let imageForm;
    let fileInput;
    let fileData;
    let imgSrcBlob;

    let filePicked = false;

    let textWidth;

    // $: filePicked = fileInput && (fileInput.files.length > 0)
    // $: filePicked = fileInput?.files.length;
    // $: filePicked = fileInput;

    $: people = [...hosts, ...guests];
    $: h = w/2;

    export let slug = "";
    export let title = "";
    export let hosts = [];
    export let guests = [];

	export async function saveImage() {
        try {

            if (fileInput.files[0]){
                fileData = fileInput.files[0];
            } else {
                const filename = `${slug}.${blobData.type.split('image/')[1]}`;
                console.log("filename: ", filename);
                fileData = new File([blobData], filename, { type: blobData.type });
                console.log("fileData: ", fileData);

            }

            // const saveImageResponse = await postData(`/.netlify/functions/save_social_image`, bufferData);
            const saveImageResponse = await postData(`/.netlify/functions/save_session_image`);
            console.log("saveImageResponse: ", saveImageResponse);
            console.log("saveImageResponse.result.data.content.download_url: ", saveImageResponse.result.data.content.download_url);

            return saveImageResponse.result.data.content.download_url

        } catch (error) {
            console.error("error saving image: ",error);
        }

	}

    
    onMount(() => {
        // const context = canvas.getContext('2d');
        // const img = new Image();
        // img.crossOrigin = "anonymous";
        // img.src = "https://archive.org/download/OurShow6-24-23/6-24-23-1400.jpg";
        // // const canvas = document.getElementById("canvas");
        // // const ctx = canvas.getContext("2d");
        // img.addEventListener("load", () => {
        //     context.drawImage(img, 0, 0);
        //     img.style.display = "none";

        //     dataURL = canvas.toDataURL();
        //     console.log(dataURL);
        //     canvas.toBlob((blob) => {
        //         console.log("blob: ", blob);
        //         blobData = blob;
        //     });
        // });

        // drawCanvas();
        // console.log("fileInput.files[0]: ", fileInput.files[0]);



    });

    afterUpdate(() => {
        console.log("afterUpdate!");
        if (canvas){
            drawCanvas();
        }
    });

    function drawCanvas(){
        const context = canvas.getContext('2d');
        context.reset();

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#000';
        context.fillRect(0, 0, w, h);

        context.fillStyle = '#fff';
        // guidelines
        context.fillRect(0,h/4,w,1);
        context.fillRect(0,h/2,w,1);
        context.fillRect(0,3*h/4,w,1);


        // Add hosts and guests
        const peopleLength = people.length;
        people.forEach((person, index) => {
            console.log('person: ', person,peopleLength);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = person.avatar_url; 
            img.addEventListener("load", () => {
                // context.drawImage(img, 7*w/16, 5*h/8, w/8, h/4);
                context.drawImage(img, (w*(1/(2*people.length))*(1+2*index))-(w/16), 5*h/8, w/8, h/4);
                // context.drawImage(img, ((w/(2*people.length))*(1+index))-(w/16), 5*h/8, w/8, h/4);
                img.style.display = "none";
                canvas.toBlob((blob) => {
                    // console.log("blob: ", blob);
                    blobData = blob;
                });

            });
        });



        context.textAlign = 'center';
        context.textBaseline = 'middle';
        // context.font = `${w/10}px serif`;
        context.font = `${w/20}px serif`;
        textWidth = context.measureText(title).width;
        // context.save();

        if (textWidth > w){

            // context.clearRect(0, 0, canvas.width, canvas.height);

            // context.fillStyle = '#000';
            // context.fillRect(0, 0, w, w/2);

            // context.fillStyle = '#fff';
            // // guidelines
            // context.fillRect(0,w/8,w,1);
            // context.fillRect(0,w/4,w,1);
            // context.fillRect(0,3*w/8,w,1);

            // context.textAlign = 'center';
            // context.textBaseline = 'middle';
            // // context.save();
            // context.font = `${w/10}px serif`;
            // // textWidth = context.measureText(title).width;


            // context.reset();
            // context.restore();
            // use Math.round(textWidth/w) to determine the number of lines needed so I can get the vertical spacing 
            console.log('split up text into multilines: ', Math.ceil(textWidth/w));
            const scale = Math.ceil(textWidth/w);
            // set font size;
            // context.font = `${w/(scale * 10)}px serif`;
            // context.font = `${w/10}px serif`;
            // split words by space in an array
            const wordsArray = title.split(' ');
            console.log("wordsArray: ", wordsArray);
            let linesArray = [];
            let currentTitle = '';
            let lineScale = scale;
            let linesIndex = 0;
            linesArray[0]= "";
            // loop through adding words
            for (let i = 0; i < wordsArray.length; i++) {

                if (context.measureText(linesArray[linesIndex] + ' ' + wordsArray[i]).width > w){
                    linesIndex++
                    linesArray[linesIndex] = wordsArray[i];
                    console.log("linesArray long enough: ", linesArray);
                } else {
                    linesArray[linesIndex] = linesArray[linesIndex] + ' ' + wordsArray[i];
                    console.log("linesArray not long enough: ", linesArray);
                }

                context.reset();
                context.clearRect(0, 0, canvas.width, canvas.height);

                context.fillStyle = '#000';
                context.fillRect(0, 0, w, h);

                context.fillStyle = '#fff';
                // guidelines
                context.fillRect(0,h/4,w,1);
                context.fillRect(0,h/2,w,1);
                context.fillRect(0,3*h/4,w,1);

                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.font = `${w/20}px serif`;

                // loop through linesArray and context.fillText
                for (let j = 0; j < linesArray.length; j++) {
                    // context.fillText(linesArray[j], w/2, w/((scale - j) * 8), w);
                    // context.fillText(linesArray[linesArray.length-1-j], w/2, ((scale - j) * w)/(15));
                    context.fillText(linesArray[j], w/2, (j * h)/(2*scale) + h/(4*scale));
                    // context.fillText(linesArray[j], w/2, w/(scale * 8), w);
                    // context.translate(0, w/(20));
                }


                // if currentTitle + wordsArray[i] > canvas width(w), set currentTitle = wordsArray[i] and decrease lineScale by 1
                // if (context.measureText(currentTitle + ' ' + wordsArray[i]).width > w){
                //     // console.log("wordsArray: ", wordsArray);
                //     linesArray.push(currentTitle);
                //     // console.log("linesArray: ", linesArray);
                //     context.fillText(currentTitle, w/2, w/(lineScale * 8), w);
                //     // context.save();
                //     console.log("longer than the width before: ", currentTitle);
                //     currentTitle = wordsArray[i];
                //     console.log("longer than the width after: ", currentTitle);
                //     lineScale--;
                //     console.log("lineScale: ", lineScale);
                //     // context.translate(0, w/(lineScale * 8));
                //     // context.translate(0, w/8);
                //     console.log("context.translate(0, w/(lineScale * 8)): ", w/(lineScale * 8))
                // } else {
                //     // context.restore();
                //     context.reset();
                //     context.clearRect(0, 0, canvas.width, canvas.height);

                //     context.fillStyle = '#000';
                //     context.fillRect(0, 0, w, w/2);

                //     context.fillStyle = '#fff';
                //     // guidelines
                //     context.fillRect(0,w/8,w,1);
                //     context.fillRect(0,w/4,w,1);
                //     context.fillRect(0,3*w/8,w,1);

                //     context.textAlign = 'center';
                //     context.textBaseline = 'middle';
                //     context.font = `${w/10}px serif`;

                //     // loop through linesArray and context.fillText
                //     for (let j = 0; j < linesArray.length; j++) {
                //         context.fillText(linesArray[j], w/2, w/((scale - j) * 8), w);
                //         // context.fillText(linesArray[j], w/2, w/(scale * 8), w);
                //         context.translate(0, w/( 8));
                //     }



                //     console.log("not longer than the width: ", currentTitle);
                //     console.log("lineScale: ", lineScale);
                //     currentTitle = currentTitle + ' ' + wordsArray[i];
                //     // context.fillText(currentTitle, w/2, w/(lineScale * 8), w);
                // }
                // console.log("wordsArray: ", wordsArray);

                // console.log("linesArray: ", linesArray);

                // context.fillText(currentTitle, w/2, w/(lineScale * 8), w);


                // context.fillText(currentTitle, w/2, w/(scale * 8), w);

                // add to canvas
                // context.restore();
                // context.fillText(currentTitle, w/2, w/8, w);
                // context.translate(0, w/(lineScale * 8));
                // context.fillText(currentTitle, w/2, w/(lineScale * 8), w);
                // context.restore();
            }
        } else {
            context.fillText(title, w/2, h/4, w);
        }



        // // Add hosts and guests
        // people.forEach((person, index) => {
        //     console.log('person: ', person);
        //     const img = new Image();
        //     img.crossOrigin = "anonymous";
        //     img.src = person.avatar_url; 
        //     img.addEventListener("load", () => {
        //         context.drawImage(img, 0, 0, w/8, w/8);
        //         img.style.display = "none";
        //         canvas.toBlob((blob) => {
        //             // console.log("blob: ", blob);
        //             blobData = blob;
        //         });

        //     });
        // });
        // const img = new Image();
        // img.crossOrigin = "anonymous";
        // img.src = "https://archive.org/download/OurShow6-24-23/6-24-23-1400.jpg";
        // // const canvas = document.getElementById("canvas");
        // // const ctx = canvas.getContext("2d");
        // img.addEventListener("load", () => {
        //     context.drawImage(img, 0, 0);
        //     img.style.display = "none";

        //     dataURL = canvas.toDataURL();
        //     // console.log(dataURL);
        //     canvas.toBlob((blob) => {
        //         // console.log("blob: ", blob);
        //         blobData = blob;
        //     });
        // });


        // canvas.toBlob((blob) => {
        //     // console.log("blob: ", blob);
        //     blobData = blob;
        // });


        // const img = new Image();
        // img.crossOrigin = "anonymous";
        // img.src = "https://archive.org/download/OurShow6-24-23/6-24-23-1400.jpg";
        // // const canvas = document.getElementById("canvas");
        // // const ctx = canvas.getContext("2d");
        // img.addEventListener("load", () => {
        //     context.drawImage(img, 0, 0);
        //     img.style.display = "none";

        //     dataURL = canvas.toDataURL();
        //     // console.log(dataURL);
        //     canvas.toBlob((blob) => {
        //         // console.log("blob: ", blob);
        //         blobData = blob;
        //     });
        // });

    };

    // Example POST method implementation:
    async function postData(url = '', data = {}) {

        const formData = new FormData();
        // console.log("fileInput: ", fileInput.files[0]);
        // formData.append('imageFile', fileInput.files[0], slug);
        formData.append('imageFile', fileData, slug);

        
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                // 'Content-Type': 'application/json',
                // 'Content-Type': 'multipart/form-data',
                'Authorization': 'Bearer ' + $user.token.access_token
            },
            // body: JSON.stringify(data) // body data type must match "Content-Type" header
            body: formData // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
        // return "cool";
    }

    // async function saveImage() {
    //     try {
    //         // const saveImageResponse = await postData(`/.netlify/functions/save_social_image`, dataURL);
    //         // console.log("dataBlob: ", dataBlob);
    //         // const saveImageResponse = await postData(`/.netlify/functions/save_social_image`, dataBlob);
    //         // console.log("saveImageResponse: ", saveImageResponse);

    //         // const imageResponse = await fetch("https://archive.org/download/OurShow7-1-23/7-1-23-1400.jpg");
    //         // console.log("imageResponse: ",imageResponse);
    //         // let bufferData = await imageResponse.arrayBuffer();
    //         // console.log("bufferData: ", bufferData);
    //         // // console.log("Buffer.from(bufferData): ",Buffer.from(bufferData));
    //         // console.log("bufferData.toString('base64'): ",bufferData.toString('base64'));

    //         if (fileInput.files[0]){
    //             fileData = fileInput.files[0];
    //         } else {
    //             const filename = `${slug}.${blobData.type.split('image/')[1]}`;
    //             console.log("filename: ", filename);
    //             fileData = new File([blobData], filename, { type: blobData.type });
    //             console.log("fileData: ", fileData);

    //         }

    //         // const saveImageResponse = await postData(`/.netlify/functions/save_social_image`, bufferData);
    //         const saveImageResponse = await postData(`/.netlify/functions/save_social_image`);
    //         console.log("saveImageResponse: ", saveImageResponse);
    //         console.log("saveImageResponse.result.data.content.download_url: ", saveImageResponse.result.data.content.download_url);

    //     } catch (error) {
    //         console.error("error saving image: ",error);
    //     }
    // }

    function handleChange() {
        console.log("onChange!: ",fileInput.files[0]);
        fileData = fileInput.files[0];
        console.log("url: ",URL.createObjectURL(fileInput.files[0]));
        imgSrcBlob = URL.createObjectURL(fileInput.files[0]);
        filePicked = true;
        // switch out canvas with image
    }

    function clearImage(){
        imageForm.reset();
        filePicked = false;
    }


</script>

<div bind:clientWidth={w}>
    {#if filePicked}
         <img class="uploaded-image" src={imgSrcBlob} alt="Info for session"/>
    {:else}
        use this generated image {textWidth}<br/>
        <canvas bind:this={canvas} width={w} height={w/2} />
    {/if}
    or upload your own:
    <form bind:this={imageForm}>
        <input type="file" on:change={handleChange} bind:this={fileInput} accept="image/*" />
    </form>
    <button on:click={saveImage} disabled={slug === ""}>Save Image</button>    
    <button on:click={clearImage} disabled={!filePicked}>Clear Image</button>    
</div>

<style>
    .uploaded-image {
        width: 100%;
    }
</style>