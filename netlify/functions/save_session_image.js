const { GITHUB_PAT, NETLIFY_PAT, SITE_ID } = process.env;
import fetch from 'node-fetch';
import Busboy from 'busboy';

import { Octokit } from "@octokit/rest";
const octokit = new Octokit({ 
    auth: GITHUB_PAT,
    userAgent: 'CodesWithUs v0.0.1', 
});

// from https://www.netlify.com/blog/2021/07/29/how-to-process-multipart-form-data-with-a-netlify-function/
// https://answers.netlify.com/t/trouble-with-handling-files-in-netlify-function/42418/34
function parseMultipartForm(event) {
  return new Promise((resolve) => {
    // we'll store all form fields inside of this
    const fields = {};

    // let's instantiate our busboy instance!
    const busboy = Busboy({
      // it uses request headers
      // to extract the form boundary value (the ----WebKitFormBoundary thing)
      headers: event.headers
    });

    // before parsing anything, we need to set up some handlers.
    // whenever busboy comes across a file ...
    busboy.on('file',(fieldname, filestream, filename, transferEncoding, mimeType) => {
        // ... we take a look at the file's data ...
        filestream.on('data', (data) => {
          // ... and write the file's name, type and content into `fields`.
          console.log("data: ",data);
          fields[fieldname] = {
            filename,
            type: mimeType,
            content: data,
          };
        });
      }
    );

    // whenever busboy comes across a normal field ...
    busboy.on('field', (fieldName, value) => {
      // ... we write its value into `fields`.
      console.log("fieldName: ", fieldName);
      fields[fieldName] = value;
    });

    // once busboy is finished, we resolve the promise with the resulted fields.
    busboy.on("close", () => {
        resolve(fields)
    });
  
    // now that all handlers are set up, we can finally start processing our request!
    busboy.end(Buffer.from(event.body, 'base64'));
  });
}

exports.handler = async (event, context) => {

    const { identity, user } = context.clientContext;

    if (user){
        const userResponse = await fetch('https://api.netlify.com/api/v1/user',{
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + NETLIFY_PAT
            },
        });
        const data = await userResponse.json();
        const userId = user.user_metadata.avatar_url.split('/u/')[1].split('?v=')[0];
        const dataId = data.avatar_url.split('/u/')[1].split('?v=')[0];

        const siteResponse = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}`,{
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + NETLIFY_PAT
            },
        });
        const siteData = await siteResponse.json();
        const githubRepo = siteData.build_settings.repo_path.split(`${data.slug}/`)[1];

        if (user.app_metadata.provider === data.login_providers[0] && user.email === data.email && userId === dataId ){
            // Authorized

            const fields = await parseMultipartForm(event);

            const imageFileBase64 = fields.imageFile.content.toString('base64');
            const imageFilename = fields.imageFile.filename.filename + '.' + fields.imageFile.filename.mimeType.split('image/')[1];

            const result = await octokit.rest.repos.createOrUpdateFileContents({
                owner: data.slug,
                repo: githubRepo,
                message: `adding ${imageFilename}`,
                path: `images/${imageFilename}`,
                content: imageFileBase64,
            });


            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Allow from anywhere 
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': '*', 
                },
                body: JSON.stringify({status: 'Success', result}),
            };    
        } else {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Allow from anywhere
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': '*', 
                },
                body: JSON.stringify({verified: false}),
            };    
        }
    
    } else {
        // Not authorized
        return {
            statusCode: 401,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere 
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': '*', 
            },
            body: JSON.stringify({status: 'Not Authorized!'}),
        };
    }    
};