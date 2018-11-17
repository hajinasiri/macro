  // This will populate survey and other forms for the user.  This file should be included by  /views/inputForm/index.hbs
  // Created Sept. 2017 by Larry Maddocks
  // jQuery(function($) {
  //function populateSurveyForm(formName, collection) {
  function populateSurveyForm(formData) {

      //     var formData='[   {       "type": "header",       "subtype": "h1",        "label": "Tell us about B1" },\
      // {       "type": "textarea",     \
      // "label": "If B1 were an animal, what kind of animal would it be?:",\
      // "className": "form-control",        "name": "textarea-1502752871298",       \
      // "subtype": "textarea"   },  {       "type": "textarea",     "label": \
      // "Problematize the ontological, phenomenological, and epistemological entailments of B1?:",\
      // "className": "form-control",        "name": "textarea-1502752923409",       "subtype": "textarea"   },  {       "type": "radio-group",      "label": "How important is B1?:",       "inline": true,     "name": "radio-group-1502752963464",        "values": [         {               "label": "Yawn",                "value": "one",             "selected": true            },          {               "label": "Dont know",               "value": "two"          },          {               "label": "Still confused",              "value": "three"            },          {               "label": "Depends who is asking",               "value": "four"         },          {               "label": "OMG!",                "value": "five"         }       ]   } ] '; //  let data = {
      //   collection: collection,
      //   id: dataFromMapEditForm.id
      //  };
      // $.get("/formApi/myFormName/inputform", /* data, */
      //   $('.fb-render').formRender({
      //       dataType: 'json',
      //       formData: data
      //   });
      var fbEditor = document.getElementById('build-wrap');
      var dbFieldObject = {
                                dbField: {
                                    label: 'dbField',
                                    maxlength: '60',
                                    description: 'name of this column in the map database'
                                } 
                            };
      var options = {
          dataType: 'json',
          formData: formData,
          disableFields: ['autocomplete',
              'button',
              'checkbox',
              'checkbox-group',
              'date',
              'file',
              'header',
              'hidden',
              'paragraph',
              'number',
              'radio-group',
              'select',
              'text',
              'textarea'
          ],
           typeUserAttrs: {
                            autocomplete: dbFieldObject,
                            button: dbFieldObject,
                            "checkbox-group": dbFieldObject,
                            date: dbFieldObject,
                            file: dbFieldObject,
                            hidden: dbFieldObject,
                            number: dbFieldObject,
                            "radio-group": dbFieldObject,
                            select: dbFieldObject,
                            text: dbFieldObject,
                            textarea: dbFieldObject
                        },
           disabledActionButtons: ['clear','data']

      };
      var formBuilder = $(fbEditor).formBuilder(options);
      
      //formBuilder.actions.setData(formData);   

      //   $.get("/formApi/" + formName + "/" + collection, /* data, */
      //       function(result) {
      //           // $("span").html(result);
      //           //console.log("result of get: " + result);
      //           if (result && result.hasOwnProperty("status") && result.status == "error") {
      //               alert("Unsuccessfull in fetching a row from db: " + result.msg);
      //           }
      //           else {
      //               $('.fb-render').formRender({
      //                   dataType: 'json',
      //                   formData: result
      //               });


      //           }
      //       }
      //   ); //var fbTemplate = document.getElementById('fb-template');
      var Fb; //some kind of object of the formBuilder api
      function getFormData(fb) {
          Fb = fb;
          

            $('.save-template').click(function() {
                    //var renderedForm = $('.formData-json');
                    // toast({msg: 'Form HTML successfully copied to clipboard.'});
                    var j = Fb.formData;
                   //j = renderedForm[0].innerText;
                       
                    var data = {};
                    data.id = formId; //"unique name of form"; See /greentiger/views/formbuilder/index.hbs
                 
                    data.collection = collection; //"collection name"; See /greentiger/views/formbuilder/index.hbs
                    data.isBlank = false;
                    data.doc = j; //JSON.stringify(j);
                    $.post('/formApi/updaterow', data, function(result) {
                        if (result.status === "success") {
                            // alert("Form insert was successfull. To see the effect of your changes, refresh the screen.");
                            console.log("New Form Inserted.");
                        }
                        else {
                            alert("Update was unsuccessfull: " + result.msg);
                        }
                    });
                });
          
      }
      formBuilder.promise.then(function(fb) { getFormData(fb) });

  }

  // );

  //disableFields: ['autocomplete', 'header','paragraph','radio-group','checkbox-group','textarea','text','button','select','number','date','file', 'hidden']};
  