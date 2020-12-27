const axios = require('axios')
var AWS = require('aws-sdk');
var dynamodb =  new AWS.DynamoDB()







exports.handler = async (event) => {
   console.log(JSON.stringify(event))



   
   var apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({apiVersion: '2018-11-29',endpoint:process.env.WEBSOCKET_URL});

   
    
     event['Records'].forEach (async(element, index, array) => {
        var val = element.dynamodb 

           var params1 = {
  Key: {
   "contactId": {
     S: val.Keys.ContactId.S
    }, 
 }, 
  TableName: "connectionDetails"
 };
 var connect = await dynamodb.getItem(params1).promise();


        let  typ = element.eventSourceARN
        var names = ""
  
             
      
     
        if (element['eventName'] == 'INSERT'){
          
            var params = {
  ConnectionId:connect["Item"]["connectionId"]["S"], // Connection ID from dynamo db should be given here
  Data:  JSON.stringify({"type":"transcribe","message": val["NewImage"]["Transcript"]["S"]
                           , "user":"Agent" ,"partial":"true"})
                    };
                    
              await  apigatewaymanagementapi.postToConnection(params).promise();
      
           
       
    
    
             }
        else if (element['eventName'] == 'MODIFY'){
                if (val["NewImage"]["Transcript"] == val["OldImage"]["Transcript"]){
                    console.log("Final",val["NewImage"]["Transcript"]["S"])


              var params = {
  ConnectionId: connect["Item"]["connectionId"]["S"],
  Data:JSON.stringify({"type":"transcribe","message": val["OldImage"]["Transcript"]["S"]
                        , "user":"Agent" ,"partial":"true"})
                    };
                    
                    
              await  apigatewaymanagementapi.postToConnection(params).promise();


                 }
                else {
                   
                   let status = ""
                      if(val["NewImage"]["IsPartial"]["BOOL"] == true){
                          
                          status = "true"
                      }else{
                          status = "false"
                      }
                      
                         


            var params = {
                
  ConnectionId: connect["Item"]["connectionId"]["S"],
  Data: JSON.stringify({"type":"transcribe","message": val["NewImage"]["Transcript"]["S"] 
                        , "user":"Agent" ,"partial":status})      

                    };
                    
              await  apigatewaymanagementapi.postToConnection(params).promise();
     
              
    
                                 }
                 
                 }
           
        });
     

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};