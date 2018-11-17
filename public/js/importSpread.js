//used in importSpread.html
//Created 9/29/2015 by Larry Maddocks
// wait for the DOM to be loaded
$(document).ready(function() {

    $('#uploadMasterDb').attr('action', "/importSpread/" + masterDB);

    $('#uploadOverrideDB').attr('action', "/importSpread/" + overrideDB);

    // bind 'uploadMasterDb' for spreadsheet import and provide a simple callback function
    $('#uploadMasterDb').ajaxForm(function(e) {
        if ($.type(e) == "object") {
            if (e.hasOwnProperty("status") && e.hasOwnProperty("msg") && e.status == "error") {
                $("#resultMessage").html("<h1>Error.</h1><p>" + e.msg + "</p>");
                return;
            }
        }
        $("#resultMessage").html("<h1>Cool.</h1><p>Stuff got imported to the database.</p>");
    });

    $('#uploadOverrideDB').ajaxForm(function(e) {
        if ($.type(e) == "object") {
            if (e.hasOwnProperty("status") && e.hasOwnProperty("msg") && e.status == "error") {
                $("#resultMessage").html("<h1>Error.</h1><p>" + e.msg + "</p>");
                return;
            }
        }
        $("#resultMessage").html("<h1>Cool.</h1><p>Stuff got imported to the database.</p>");
    });

    document.getElementById("uploadMastBtn").onchange = function() {
        $("#resultMessage").html("<p></p>");
        var filename = this.value.split('\\').pop();
        $("#myMessage").html("<p>Click the Upload botton to send the file: <b><br><br>" + filename + "</b>");
    };

    // Let the user know something uploading ...
    document.getElementById("masterSubmitButton").onclick = function() {
        $("#resultMessage").html("<h1> uploading . . . </h1>");
    };

    document.getElementById("overSubmitButton").onclick = function() {
        $("#resultMessage").html("<h1> uploading . . . </h1>");
    };

    document.getElementById("uploadOverBtn").onchange = function() {
        $("#resultMessage").html("<p></p>");
        var filename = this.value.split('\\').pop();
        $("#myOverMessage").html("<p>Click the Upload botton to send the file: <b><br><br>" + filename + "</b>");
    };

    // bind 'uploadSVG' for svg import and provide a simple callback function
    $('#uploadSVG').ajaxForm(function() {
        $("#resultMessage").html("<h1>SVG Upload Happened.</h1>");
    });
    // document.getElementById("uploadSVGBtn").onchange = function() {
    //     $("#mySvgMessage").html("<p><b>You chose " + this.value + ". Now click the green upload button and we're in business.</b></p>");
    // };
});
