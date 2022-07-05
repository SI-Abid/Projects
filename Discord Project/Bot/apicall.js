const data = require('./nametag.json');
var request = require('request');
// const { defaults } = require('request');
/*
"clientId": "eeac8d0afed4e96cfac5429d26575139",
    "clientSecret":"cd9e96caaabe7439e5002d96b407599d9b2d6cd6a98f34eaa715f02f2e022f2f"
*/
exports.run = (lang, code, input, fn)=>
{
    // var input = "1011";
    // var code = `#include <iostream>\nusing namespace std;\n\nint main()\n{\n int n; cin>>n; cout<<n<<endl; cout<<"Hello world";    return 0; }`;
    // var lang = "C++_14"
    var program = {
        script : code,
        language: data[lang],
        versionIndex: "0",
        stdin: input,
        clientId: "YOUR_CLIENT_ID",
        clientSecret:"YOUR_CLIENT_SECRET"
    };
    request({
        url: 'https://api.jdoodle.com/v1/execute',
        method: "POST",
        json: program
    }, function(error, response, body) {
        // console.log('error:', error);
        // console.log('statusCode:', response && response.statusCode);
        // console.log('body:', body);
        // return body;
        fn(body);
    });
    // console.log("er: ",er.body);
}    

// export {runner};
