const { VONAGE_APP_ID, VONAGE_PRIVATE_KEY64, NETLIFY_PAT, SITE_ID } = process.env;
import fetch from 'node-fetch';
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";
import { Video } from "@vonage/video";
import { Client, AuthenticationType } from "@vonage/server-client";

exports.handler = async (event, context) => {
    // // Only allow POST
    // if (event.httpMethod !== "POST") {
    // return { statusCode: 405, body: "Method Not Allowed" };
    // }

    const { identity, user } = context.clientContext;
    // console.log("user: ", user, SITE_ID);

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

        if (user.app_metadata.provider === data.login_providers[0] && user.email === data.email && userId === dataId ){
            // Authorized
            const privateKey = Buffer.from(VONAGE_PRIVATE_KEY64, 'base64');
            const applicationId = VONAGE_APP_ID; 
            const credentials = {
                applicationId,
                privateKey,
            };

            const vonage = new Vonage(credentials);
            const video = new Video(credentials);
            vonage.video = video;

            // initialize client to make Conversation API calls
            const vonageClient = new Client (new Auth(credentials));
            vonageClient.authType = AuthenticationType.JWT

            try {
                const session = await vonage.video.createSession({ mediaMode:"routed" });
                const conversation = await vonageClient.sendPostRequest('https://api.nexmo.com/v0.3/conversations',{});
                // console.log("conversation: ", conversation);
        
                return {
                    statusCode: 200,
                    body: JSON.stringify({applicationId, sessionId: session.sessionId, conversationId: conversation.data.id}),
                };
            
            } catch(error) {
                console.error("Error creating session: ", error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'createSession error:' + error }),
                };
            }
        } else {
            return {
                statusCode: 403,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Allow from anywhere
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': '*', 
                },
                body: JSON.stringify({status: 'Not Authorized!'}),
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