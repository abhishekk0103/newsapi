const {
  HttpUtils,
  HttpUtils: { request, successResponse, errorResponse },
  STATUS,
} = require("quickwork-adapter-cli-server/http-library");


const app = {
    name : "newapi",
    alias : "newapi",
    description : "App Description",
    version : "1",
    config : {"authType":"api_key"},
    webhook_verification_required : false,
    internal : false,
    connection : {
        input_fields : () => [
            {
              key : "apiKey",
              name: "API Key",
              controlType : "password",
              required: true,
              type : "string",
              hintText: "Enter API key",
              helpText : "Enter API key",
              isExtendedSchema : false
            }
        ],

        authorization: {
            type: "api_key",

            credentials: (connection) => {
                return connection.input["apiKey"];
            }
        }
    },
    actions : {
      list_sources: {
        description: "Lsit sources",
        hint: "Create an <b>event</b> via <b>Google Calendar</b>",

        input_fields: () => [
          {
            key: "category",
            name: "Select Category",
            hintText: "The category for which you want to retrieve a list of sources",
            helpText: "The category for which you want to retrieve a list of sources",
            required: true,
            type: "string",
            controlType: "select",
            isExtendedSchema: false,
            pickList: [
              ["business", "business"],
              ["entertainment", "entertainment"],
              ["general", "general"]
            ]
          },
          {
            key: "langcode",
            name: "Language Code",
            hintText: "Whether you want to display the list of only archived tags or not. If selected No, a list of only active tags will be retrieved.",
            helpText: "Whether you want to display the list of only archived tags or not. If selected No, a list of only active tags will be retrieved.",
            required: false,
            type: "string",
            controlType: "select",
            isExtendedSchema: false,
            pickList: [
              ["ar", "ar"],
              ["de", "de"],
              ["en", "en"],
              ["es", "es"],
            ]
          },
          {
            key: "country",
            name: "Country",
            hintText: "The name of the tag with which you want to filter the list of tags. E.g., Tag 1.",
            helpText: "The name of the tag with which you want to filter the list of tags. E.g., Tag 1.",
            required: false,
            type: "string",
            controlType: "select",
            isExtendedSchema: false,
            pickList: [
              
              ["in", "in"],
              ["us", "us"],
              ["eg", "eg"],
              ["sa", "sa"],
            ]
          },
        ],

        execute: async (connection, input) => {
          try {
            const url = `https://newsapi.org/v2/top-headlines/sources?category=${input.category}&country=${input.country}&apiKey=${connection.input.apiKey}`;
            let userHeader = {
              'User-Agent' : "user"
            }
            const response = await HttpUtils.request(url, userHeader,  null, HttpUtils.HTTPMethods.GET);

            if (response.success === true) {
              return HttpUtils.successResponse(response.body);
            } else {
              return HttpUtils.errorResponse(response.body, response.statusCode);
            }
          } catch (error) {
            console.log(error);
            return HttpUtils.errorResponse(error.message);
          }
        },

        output_fields: () => [],

        sample_output: connection => {},
      }
    },
    triggers: {
      new_news: {
        description: "New News",
        hint: "Triggers when new news is created via constant contact",
        type:"poll",

        input_fields: () =>[
          {
              key: "query",
              name: "Query",
              hintText: "The name of the tag which you want to add to a workspace. E.g, Tag 1.",
              helpText: "The name of the tag which you want to add to a workspace. E.g, Tag 1.",
              required: false,
              type: "string",
              controlType: "text",
              isExtendedSchema: false,
            },
        ],

        execute: async (connection, input, nextPoll) => {
          if(!nextPoll){
            nextPoll =  new Date().toISOString();
          }
          const url = `https://newsapi.org/v2/everything?q=${input.query}&apiKey=${connection.input.apiKey}`;
          const headers = app.connection.authorization.credentials(connection);
          const response = await HttpUtils.request(url, headers);
          if(response.success == true) {
            return successResponse({
              events: response.body,
              nextPoll: "new"
            })
          }
        },

        dedup : () =>{
          return "hello";
        },

        output_fields: () => [
          {
            "key": "status",
            "name": "Status",
            "hintText": "Status",
            "helpText": "Status",
            "isExtendedSchema": false,
            "required": false,
            "type": "string",
            "controlType": "text"
          },
          {
            "key": "sources",
            "name": "Sources",
            "hintText": "Sources",
            "helpText": "Sources",
            "isExtendedSchema": false,
            "required": false,
            "type": "array",
            "controlType": "array",
            "as": "object",
            "properties": [
              {
                "key": "id",
                "name": "Id",
                "hintText": "Id",
                "helpText": "Id",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "name",
                "name": "Name",
                "hintText": "Name",
                "helpText": "Name",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "description",
                "name": "Description",
                "hintText": "Description",
                "helpText": "Description",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "url",
                "name": "Url",
                "hintText": "Url",
                "helpText": "Url",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "category",
                "name": "Category",
                "hintText": "Category",
                "helpText": "Category",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "language",
                "name": "Language",
                "hintText": "Language",
                "helpText": "Language",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "country",
                "name": "Country",
                "hintText": "Country",
                "helpText": "Country",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              }
            ]
          }
        ]
      },
    },
    test : async connection => {
      try{
        let url = `https://newsapi.org/v2/everything?q=business&apiKey=${connection.input.apiKey}`;
        // 89e9865a255f407fb752cebeb6255f46
        let headers = {
          'User-Agent' : "user"
        }
        let response= await HttpUtils.request(url, headers);
        if (response.success == true) {
          return HttpUtils.successResponse(response.body);
        } else {
          return HttpUtils.errorResponse(response.message, response.statusCode);
        }
      }catch(error){
        return HttpUtils.errorResponse(error.message)
      }   
    },
    objectDefinitions: {
    },
    pickLists : {
    
    }
};

module.exports = app;