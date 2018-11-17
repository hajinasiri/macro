//  csv2si.jsx
//  Uses A CSV file input
//
//  Marshall Clemens (and the folks on the Adobe Illustrator scripting forum)  11-09-16
//
//
//
// // TO DO: add a switch for which layers to put stuff in - only the importLayer or all layers in the doc.  Currently the code searched the whole document,
// and if it doesn't find the layer it adds it to the importLayer.
// TO DO: auto render, outline text, save as SVG (for when things get really automated)
//
// Version 1.2 Added the ability to create styled rectangles from the 'symbol' name if 'name' is defined in AI as a graphic style and not symbol
// Version 1.3 getLayerByID now searches all layers within idoc - and will place art in layers found.  And it will move nested layers into parent layers.
// Version 1.5 added the ability to radially distribute (calculate ooox, oooy) from outline-numbered UNOs - marked and radialSubstep - with the radius given in ooox and the angle-offset in oooy
//              The other coordinates are then offests from the calculated ooox, oooy
// Version 1.6 through 1.8
// This version has custom corrections for the Arcadis way step numbering - to adjust index[] and subStep0
// Added new "kind"s :  radialSubstep -     calculates angles based on the outline numbering of UNOs with a "Step" prefix, and distributes UNO evenly per substep
//                      radialLevel -       calculates angles based on the outline numbering of UNOs with a "Step" prefix, but distributes UNO evenly across the whole level
//                      angular -           does NOT use the outline numbered angles, instead it uses the offsetSet angle plus radius to plot the x, y position for the UNO
// Version 1.9  Added the ability to draw rectangles and ellipses and well as symbols, using the xxxkind variables: symbol, rect, or ellipse.
// Version 3.0  Rewritten for the new V2 code: ooo (single trigger), xxx, vvv.
// Version 3.4  Added label field (instead of u
// Version 3.7  I've removed all the outline rendering code, and those calculations have been moved into the new spreadsheet which calulates all the outline UNO rendering values.
// Version 3.9  Added unoSymbol method of creating UNOs.  Soooooo much better.
// Version 4.0  Added the 2 linkSymobl drawing methods: by Rectangle or Ellipse offset, or uno-outline clipping .
//              Do all nodes first, then links - so the links can find their unoa a's and b's.
//              render now uses 'X' for render OR 'N' for render only if the UNO doesn't already exist.
//              For now, the old style piece-by-piece code is disabled as we're always switching on type: node or link.
// Version 4.1  No longer saving the all the old rendering variables to the CSV file - and thus not reading them in, and removed old render code.
// Version 4.3  Added merging for render = 'N'
// Version 4.4  Added image placement for symbol = /image/filename
// Version 4.5  UNOs are now properly placed at the ooo center point. Subtitle placement: subtitle > (optional) scale > (optional) 1 = space instead of CR
// Version 4.6  Removed layer sorting on render = 'N' if the object is not rendered.  Not deleting link symbol mask object if their opacity it > 0.  Added curve drawing.
//              Also for links, convert area text to point text at the end of label placing - using the new setLabel() function.
// Version 4.7  10/25/2017 - swithcing from using using mask objects in the link symobol, to using the unoa, unob, ooo objects to do the link offsets.  Deleted the trimming offset method code.
// Version 4.8  10/30/2017 – Added place UNOs at parent.  getoooCoor now find the coordinates for the whole ooo layer.
//

// Globals that control the behavior of the renderer.
var scaleText = false;          // Boolean re whether text labels should be scaled.
var disableRadial = true;       // if true, we skip all the radial and angular code
var createAllLayers = true;     // Not implemented yet
var idoc = app.activeDocument;
var standardsDoc;

// UNO variables.  These per-spreadsheet-row variables are used a globals by the sub-functions
var	render;
var	id;
var	label;
var	parent;
var	subparent;
var	kind;
var	classes;
var	scale1;
var	scale2;
var	oooOpacity;
var	sssOpacity;
var	xxxOpacity;
var	vvvOpacity;
var	oookind;
var	ooosymbol;
var	ooox;
var	oooy;
var	ooow;
var	oooh;

var	unoa;
var	unob;
var	subtitle;
var	atParent;

var	linestyle;
var	startKind;
var	endKind;
var	startOffsetX;
var	startOffsetY;
var endOffsetX;
var endOffsetY;
var	routing;
var fromPoint = [];
var toPoint = [];
var fromMask;
var toMask;

/*
var	labelString;
var	labelParams;
var	offsetAngle;
var	radius;
var	xOffset;
var	yOffset;
var	ssskind;
var	ssssymbol;
var sssstack;
var	sssx;
var	sssy;
var	sssw;
var	sssh;
var	xxxkind;
var	xxxsymbol;
var	xxxstack;
var	xxxx;
var	xxxy;
var	xxxw;
var	xxxh;
var xxxLabel;
var xxxLabelString;
var xxxLabelParams;
var	vvvkind;
var	vvvsymbol;
var vvvstack;
var	vvvx;
var	vvvy;
var	vvvw;
var	vvvh;
var vvvLabel;
var vvvLabelString;
var vvvLabelParams;
*/


// we put the whole program into the function doEverything so that we can use return to terminate execution on an error.
doEverything();

function doEverything() {

    var i;
    var irow;
    var coordinates = [];
    // Layer variables
    var importLayer;     // put everything in a layer that matches the name of the .csv file
    var unoLayer;
    var newUnoLayer;
    var parentLayer;
    var xxxLayer;
    var vvvLayer;
    var oooLayer;
    var tempLayer;
/*
    var labelx, labely;
    var newcoor;
    var labelLayer;
    var sssLayer;
*/

    if (app.documents.length > 0) {
        // Set autosizing in case we do any text frames
        app.preferences.setBooleanPreference("text/autoSizing", true);

        // GET ILLUSTRATOR AND .CSV INPUT FILES
        // Open the file with the graphic standards libraries - all kept in a single .ai file - see https://forums.adobe.com/message/8461351#8461351
        var openOptions = new OpenOptions();
        var candidateDoc;
        var standardsFile;

        // See if the standards file is already open, if not, open it
        for ( i = 0; i < app.documents.length; i++ ) {
            candidateDoc = app.documents[i];
            if (candidateDoc.name == "standards.ai" ) {
                standardsDoc = candidateDoc;
            }
        }
        if( standardsDoc == null ) {
            standardsFile = File.openDialog("Graphic Standards File");
            standardsDoc = app.open(standardsFile, null, openOptions);
        }

        // Import the paragraph styles (unfortunately we can't do this for symbols and graphic styles)
        // idoc.importParagraphStyles(standardsFile);

        // Bring the active doc back to the front
        idoc.activate();

        // Read in a XML file and put the data in an array

        var inputFile = File.openDialog("CSV Input File");
        if (inputFile == null) {
            alert('Could not open .csv file: ' + inputFile.name);
            stop();
        }

        var iData = CSVobject(inputFile);
        if (iData == null) {
            return;
        }
        // alert('CSV file has ' + iData[0].length + ' columns…');
        // alert('CSV file has ' + iData.length + ' rows…');

        // Make sure nothing is selected
        app.executeMenuCommand("deselectall");

        // -----------------------------------------------------------------------------
        //
        // GET THE UNO DATA
        //

        // Check for the import layer - named after the input file - where we'll put everything, create if it doesn't exist
        if ((importLayer = getLayerByID(inputFile.name)) == null) {
            importLayer = idoc.layers.add();
            importLayer.name = inputFile.name;
        }

        // We make 2 passes through all the rows - first renering the nodes, then the links.  This is so the links can find their nodes.
        // For each row of the spreadsheet; where each row = one UNO
        // We're looping forward, so the stacking order will be the reverse of the the CSV file order: the first things in the CSV will be at the bottom of the stack
        // The kind can only be 'node' or 'link'
        var loopKind = ["node", "link"];
        var pass, theLoopKind;

        for(pass=0;pass < 2;pass++){
            theLoopKind = loopKind[pass];
            for (irow = 0; irow < iData.length; irow++)
            unoLoop: {
                render = (getCellbyHeader(iData, irow, "render"));
                // Don't do anything unless this row is marked as a row to render
                // If render is blank - or anything other that R, N, or M - do nothing with that row
                // Be careful about creating duplicate IDs  - because placing a symbol creates all new layers.
                // render = "X"  if UNO layer exists delete it and replace it with a new one
                // render = "N" if UNO layer exists, and is NOT empty, skip the UNO entirely and only render new UNOs. If it is empty, merge new stuff into it
                // The render = "N" scheme allow the designer to delete the UNOs they want to re-render, while leaving the undeleted UNOs as is.
                // The merge function is kinda slow - but it's the only way to I've figure out to handle existing layers with UNO symbol placement.
                // If the layer is locked, skip over it entirely.
                //
                if ( render == "X" || render == "N" || render == "M") {
                    kind = (getCellbyHeader(iData, irow, "kind"));
                    if(kind == theLoopKind)
                    {
                        // Dole out the UNO variables from the CSV file array ~ in the order they appear in the CSV
                        // We do this as a separate step to more easily adjust to changes in the spreadsheet schema - and to make the code more readable
                        // Be sure to convert number strings to numbers

                        id                  =       (getCellbyHeader(iData, irow, "id"));
                        label               =       (getCellbyHeader(iData, irow, "label"));
                        parent              =       (getCellbyHeader(iData, irow, "parent"));
                        subparent           =       (getCellbyHeader(iData, irow, "subparent"));
                        classes             =       (getCellbyHeader(iData, irow, "classes"));
                        scale1              = Number(getCellbyHeader(iData, irow, "scale1"));
                        scale2              = Number(getCellbyHeader(iData, irow, "scale2"));
                        oooOpacity          = Number(getCellbyHeader(iData, irow, "oooOpacity"));
                        oookind             =       (getCellbyHeader(iData, irow, "oookind"));
                        ooosymbol           =       (getCellbyHeader(iData, irow, "ooosymbol"));
                        ooox                = Number(getCellbyHeader(iData, irow, "ooox"));
                        oooy                = Number(getCellbyHeader(iData, irow, "oooy"));
                        ooow                = Number(getCellbyHeader(iData, irow, "ooow"));
                        oooh                = Number(getCellbyHeader(iData, irow, "oooh"));

                        unoa                =       (getCellbyHeader(iData, irow, "unoa"));
                        unob                =       (getCellbyHeader(iData, irow, "unob"));
                        subtitle            =       (getCellbyHeader(iData, irow, "subtitle"));
                        atParent            = Number(getCellbyHeader(iData, irow, "atParent"));

                        // -----------------------------------------------------------------------------
                        //
                        // PLACE AN UNO SYMBOL
                        // There are two ways to create UNOs - the layer-by-layer method below, or by placing a 'UNO Symbol' -
                        // a symbol that contains all the desired UNO layers and artwork.  Once the UNO Symbol is placed,
                        // it must be broken, and the elements chaned as needed, e.g. the layer name / ID and Label.
                        // If the symbol name begins with 'uno', then we use the UNO Symbol method.
                        //
                        // Or
                        // -----------------------------------------------------------------------------
                        //
                        // CREATE THE UNO LAYER(S)
                        // Now that we have the data from the spreadsheet, we're ready to create the Illustrator layers and artwork
                        // Create the UNO layer: in the import layer if there's no parent, or as a sublayer of  'parent' or the parent's xxx or vvv layer)
                        // If the layer doesn't already exist, create it - including the UNO class designation(s)
                        // the getByName method(s) throw an error if the named thing doesn't exist - so we have to use try{} and catch(e){}
                        //

                        if(kind == "node" || kind == "link") {

                            var doRender = true;
                            unoLayer = getLayerByID(id);

                            if( unoLayer != null) {
                                if(unoLayer.locked) { continue; }

                                if(render == 'X'){
                                    unoLayer.remove();
                                }
                                else if(render == 'N' && isEmpty(unoLayer) == false){
                                    // If the UNO layer exists, AND isn't empty, don't render it - AND don't do the layer sorting
                                    doRender = false;
                                }
                            }

                            // Place the node or link kind of things -----------------------------------------------------------
                            if(doRender) {
                                if(kind == "node"){
                                    // Place the unoSymbol and set the contents
                                    newUnoLayer = placeUNOSymbol(importLayer);
                                }
                                else if(kind == "link") {
                                    // The object's to be connected must already exist in the Illustrator doc
                                    // The link is drawn between the points defined by the object's ooo group
                                    // Interactive links must also have something in the ooo layer.
                                    // If there is a label, it will be placed at the labelPoint returned from the line router

                                    // Get the from to points for the line - set the from/to global variables

                                    if( ! (tempLayer = getLayerByID(unoa)) ) {
                                        alert("Could not find the unoFrom/unoa: "+unoa);
                                        break unoLoop;
                                    }
                                    coordinates = getoooCoor(tempLayer);
                                    fromPoint[0] = coordinates[0];
                                    fromPoint[1] = coordinates[1];
                                    // Use the ooo group of unoa and unob as the mask items
                                    oooLayer = tempLayer.layers.getByName("ooo");
                                    fromMask = oooLayer.pathItems[0];

                                    if( ! (tempLayer = getLayerByID(unob)) ) {
                                        alert("Could not find the unoTo/unob: "+unob);
                                        break unoLoop;
                                    }
                                    coordinates = getoooCoor(tempLayer);
                                    toPoint[0] = coordinates[0];
                                    toPoint[1] = coordinates[1];
                                    // Use the ooo group of unoa and unob as the mask items
                                    oooLayer = tempLayer.layers.getByName("ooo");
                                    toMask =   oooLayer.pathItems[0];

                                    // Place the linkSymbol and set the contents
                                    newUnoLayer = placeLinkSymbol(importLayer);
                                }
                            }

                            // If we're merging UNOs, then we just move the new stuff into the existing UNO layer, else use the new placed layer
                            // unless render == 'N' && doRender == false - in which case we just use the existing unoLayer
                            if(render == 'N' && doRender == true){
                                // merge stuff from newUnoLayer into unoLayer if there is an unoLayer, otherwise use the newUnoLayer
                                if(unoLayer != null){
                                    mergeUNOs(newUnoLayer,unoLayer);
                                }
                                else {
                                    unoLayer = newUnoLayer;
                                }

                            }
                            else if(render == 'X') {
                                unoLayer = newUnoLayer;
                            }

                            if(doRender == true){
                                // Do this layer moving stuff for both nodes and links ------------------------------------

                                // Create find/create the parent layer
                                if (parent == "") {                                     // there is no parent layer specified, the parent is the import layer
                                    parentLayer = importLayer;
                                }
                                else {
                                    parentLayer = getLayerByID(parent);
                                    if (parentLayer == null) {                          //  there is a parent layer specified, if it's is missing, create it
                                        parentLayer = importLayer.layers.add();
                                        parentLayer.name = parent;
                                    }
                                }

                                // Move the unoLayer to the right place in the parent
                                if (subparent == "vvv" || subparent == "") {
                                    try {
                                        vvvLayer = parentLayer.layers.getByName("vvv");             // the vvv layer exists
                                    }
                                    catch (e) {
                                        vvvLayer = parentLayer.layers.add();                        // the vvv layer doesn't exist - so create it - then add the new UNO layer
                                        vvvLayer.name = "vvv";
                                    }
                                    unoLayer.move(vvvLayer, ElementPlacement.PLACEATBEGINNING)
                                }
                                else if (subparent == "xxx") {
                                    try {
                                        xxxLayer = parentLayer.layers.getByName("xxx");             // the vvv layer exists
                                    }
                                    catch (e) {
                                        xxxLayer = parentLayer.layers.add();                        // the vvv layer doesn't exist - so create it - then add the new UNO layer
                                        xxxLayer.name = "xxx";
                                    }
                                    unoLayer.move(xxxLayer, ElementPlacement.PLACEATBEGINNING)
                                }
                                else if (subparent == "uno") {
                                    // Move the UNO under the parent layer as an immediate child
                                    unoLayer.move(parentLayer, ElementPlacement.PLACEATEND)
                                }
                                else {
                                    alert("Un-allowed subparent value: "+subparent+" for UNO id: "+id);
                                    return null;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Last thing to do is to loop through everything again and change the names to add the classes - including the " class:" prefix
        // We don't do this in the first pass due to the problem of finding UNO name with appended classes
        for (irow = iData.length - 1; irow >= 0; irow--) {
            render = (getCellbyHeader(iData, irow, "render")); // Don't do anything unless this row is marked as a row to render
            if (render == "X") {
                id = (getCellbyHeader(iData, irow, "id"));
                classes = (getCellbyHeader(iData, irow, "classes"));
                if (classes != "") {
                    unoLayer = getLayerByID(id);
                    if (unoLayer != null) {
                        var classNames = classes.split(" ");
                        for (i = 0; i < classNames.length; i++) {
                            id += " class:" + classNames[i];
                        }
                        unoLayer.name = id;                         // (re)name the UNO layer with the added classes
                    }
                }
            }
        }
    }
}

function isEmpty(layer) {
    var i;
    var layerName;
    var sssLayer;

    // check for any items in the first level layers (e.g. ooo, xxx, vvv, sss), or the first sub layer of these
    // TODO - look within the xxx-sss and vvv-sss for content - using catch e ?

    for(i=0;i < layer.layers.length; i++) {
        switch(layerName = layer.layers[i].name) {
            case  "ooo":
                if( layer.layers[i].pageItems.length > 0) {
                    return false;
                }
                break;
            case "sss class:label":
                if( layer.layers[i].pageItems.length > 0) {
                    return false;
                }
                break;
            case "xxx":
                if(layer.layers[i].layers.length > 0) {
                    try {
                        sssLayer = layer.layers[i].layers.getByName("sss");
                        if( sssLayer != null) {
                            if (sssLayer.pageItems.length > 0) {
                                return false;
                            }
                        }
                    }
                    catch (e) {
                        break;
                    }
                }
                break;
            case "vvv":
                if(layer.layers[i].layers.length > 0) {
                    try {
                        sssLayer = layer.layers[i].layers.getByName("sss");
                        if( sssLayer != null) {
                            if (sssLayer.pageItems.length > 0) {
                                return false;
                            }
                        }
                    }
                    catch (e) {
                        break;
                    }
                }
                break;
            case "sss":
                if( layer.layers[i].pageItems.length > 0) {
                    return false;
                }
                break;
        }
    }

    return true;
}

function mergeUNOs(newLayer, oldLayer) {
    var i;
    var sssLayer;
    var targetLayer;
    var layerName;

    // go through all the things in newLayer, copy-pasting them to oldLayer
    // Does NOT look for loose artwork in the layer - only looks for standard things that should be in an UNO symbol
    for(i=0;i < newLayer.layers.length; i++) {
        switch(layerName = newLayer.layers[i].name) {
            case  "ooo":
                doMerge(newLayer.layers[i],oldLayer,layerName);
                break;
            case "sss class:label":
                doMerge(newLayer.layers[i],oldLayer,layerName);
                break;
            case "xxx":
                // doMerge(newLayer.layers[i],oldLayer,layerName);
                if(newLayer.layers[i].layers.length > 0){
                    sssLayer = newLayer.layers[i].layers.getByName("sss");
                    if( sssLayer  != null) {
                        // Check to see if the target has an xxx layer
                        targetLayer = oldLayer.layers.getByName(layerName);
                        if ( targetLayer == null ) {
                            targetLayer = oldLayer.layers.add(layerName);   }
                        doMerge(sssLayer,targetLayer,"sss");
                    }
                }
                break;
            case "vvv":
                // doMerge(newLayer.layers[i],oldLayer,layerName);
                if(newLayer.layers[i].layers.length > 0) {
                    sssLayer = newLayer.layers[i].layers.getByName("sss");
                    if( sssLayer  != null) {                        // Check to see if the target has a vvv layer
                        targetLayer = oldLayer.layers.getByName(layerName);
                        if ( targetLayer == null ) {
                            targetLayer = oldLayer.layers.add(layerName);   }
                        doMerge(sssLayer, targetLayer, "sss");
                    }
                }
                break;
            case "sss":
                doMerge(newLayer.layers[i],oldLayer,layerName);
                break;
        }
    }

    // Then delete the new layer
    newLayer.remove();

}

function doMerge(source,target,name){
    var sel, j;
    var targetLayer;
    var duplicatedBit;

    // deselect all - ensure there is nothing in the document selected already.
    app.executeMenuCommand("deselectall");
//    source.hasSelectedArtwork = false;
//    target.hasSelectedArtwork = false;

    source.hasSelectedArtwork = true;   // select everything in that layer
    sel = idoc.selection;
    //now copy the selected new stuff into the existing layer - create if it doesn't exist.
    try {
        targetLayer = target.layers.getByName(name);
    }
    catch (e) {
        targetLayer = target.layers.add(name);
    }

    // copy the contents over - looping backwards so the stacking order comes out right
    for(j = sel.length - 1; j >= 0; j--) {
        duplicatedBit = sel[j].duplicate(targetLayer);
        duplicatedBit.selected = false;
        sel[j].selected = false;
    }

//    app.executeMenuCommand("deselectall");
//    source.hasSelectedArtwork = false;
//    targetLayer.hasSelectedArtwork = false;
//    idoc.hasSelectedArtwork = false;
}


function placeUNOSymbol(theLayer) {
    var symbol;
    var newcoor;
    var newUNOLayer, labelLayer, theLabel;
    var theSymbol;
    var deltaX;
    var deltaY;
    var fileName;
    var imageLayer;
    var parentLayer;
    var i;

    // Check to see if this is an placed image - signaled by the symbol starting with the name 'image'
    // For now we're hard-coding a single image placing symbol named 'imageSymbol'

    fileName = ooosymbol.substring(0, 6);
    if (fileName == "/image") {
        fileName = ooosymbol;
        ooosymbol = "imageSymbol";
    }

    // place the UNO Symbol - using the ooo variables

    if ((symbol = getSymbol(ooosymbol)) != null) {
        theSymbol = theLayer.symbolItems.add(symbol);
        // If there is a width or height use them, otherwise stick with the default for the symbol
        if (ooow > 0.0) {
            theSymbol.width = ooow;
        }
        if (oooh > 0.0) {
            theSymbol.height = oooh;
        }

        // If the scale isn't 0 (an error) or 1.0 (no need to scale) then scale the whole symbol.
        if (scale1 != 0.0 || scale2 != 0.0 || scale1 != 1.0 || scale2 != 1.0) {
            var scaleMatrix = app.getScaleMatrix(scale1 * 100, scale2 * 100);
            theSymbol.transform(scaleMatrix);
        }

        // If the opacity value is less than 1.0, then adjust the opacity - otherwise use the Symbol/Style opacity
        if (oooOpacity <= 1.0) {
            theSymbol.opacity = oooOpacity * 100;
        }

        // Now break the symbol into it's component layers - and find the new UNO layers and rename them to the unoID
        theSymbol.breakLink();
        newUNOLayer = theLayer.layers.getByName(ooosymbol);

        // Move the symbol = the symbol was relocated to its position at the upper left corner - move everything to the center point OF THE OOO-GROUP
        // Place the UNO relative to its parent if atParent is true
        try {
            var oooLayer = newUNOLayer.layers.getByName("ooo");
            try {
                var theooo = oooLayer.pathItems[0];
                if(atParent == 1) {
                    if (parentLayer = getLayerByID(parent)) {
                        coordinates = getoooCoor(parentLayer);
                        deltaX = coordinates[0] + ( ooox - (theooo.left + (theooo.width / 2)));
                        deltaY = coordinates[1] + (-oooy - (theooo.top - (theooo.height / 2)));
                    }
                    else {
                        alert("Could not find the unoFrom/unoa: " + parent);
                    }
                }
                else {
                    deltaX = ooox - (theooo.left + (theooo.width / 2));
                    deltaY = -oooy - (theooo.top - (theooo.height / 2));
                }

                // Select them move all the things in the UNO layer
                selectAll(newUNOLayer);
                var theThings = app.activeDocument.selection;
                for (i = 0; i < theThings.length; i++) {
                    theThings[i].translate(deltaX, deltaY);
                }
            }
            catch (e) {
            }
        }
        catch (e) {
        }

        // Set the ID
        newUNOLayer.name = id;

        // Set the label
        setLabel(newUNOLayer);

        // If we have an image symbol, place (link, not embed) the image in the layer that has a rect.
        // Look to see if the link is in the UNO-sss, xxx-sss, or vvv-sss

        if (ooosymbol == "imageSymbol") {
            try {
                imageLayer = newUNOLayer.layers.getByName("sss");
                if (imageLayer.pathItems.length >= 1) {
                    placeImage(imageLayer, fileName);
                }
            }
            catch (e) {
            }
            try {
                imageLayer = newUNOLayer.layers.getByName("xxx");
                try {
                    imageLayer = imageLayer.layers.getByName("sss");
                    if (imageLayer.pathItems.length >= 1) {
                        placeImage(imageLayer, fileName);
                    }
                }
                catch (e) {
                }
            }
            catch (e) {
            }
            try {
                imageLayer = newUNOLayer.layers.getByName("vvv");
                try {
                    imageLayer = imageLayer.layers.getByName("sss");
                    if (imageLayer.pathItems.length >= 1) {
                        placeImage(imageLayer, fileName);
                    }
                }
                catch (e) {
                }
            }
            catch (e) {
            }
        }

        return newUNOLayer;
    }
}

function setLabel (unoLayer) {
    var labelLayer;
    var theLabel;
    var deltaX;
    var deltaY;
    var textY;

    try{
        labelLayer = unoLayer.layers.getByName("sss class:label");

        if (labelLayer != null) {
            try {
                theLabel = labelLayer.textFrames[0];

                // Add the subtitle
                var numChars = label.length;
                var subTitling = subtitle.split(">");
                if (subTitling[0].length > 0) {                             // check that we have a subtitle
                    if(subTitling.length > 2 && subTitling[2] == "1") {      // use a space instead of a CR if the third parameter = 1
                        label += " " + subTitling[0];
                    }
                    else {
                        label += "\r" + subTitling[0];
                    }
                }

                theLabel.contents = label;

                // Change the scale of subtitle if that optional parameter was included
                try {
                    if (subTitling[1].length > 0) {
                        var textrange = theLabel.characters[numChars + 1];
                        textrange.length = subTitling[0].length;
                        textrange.characterAttributes.size *= subTitling[1];
                    }
                }
                catch (e) {
                }

                // If it's an area text frame, then we adjust the text to fit and the vertically center it
                if(theLabel.kind == TextType.AREATEXT || theLabel.kind == TextType.PATHTEXT){
                    // Store the desired vertical-center point of the text
                    textY = theLabel.top - (theLabel.height / 2);

                    // Handle the case where there is unset text in a frame: shrink the text size until all the text fits in the text frame
// 03.23.18 - rendering was getting stuck in an infinite loop on this routine - traced through but couldn't see why.  Font size getting reset somehow?
//                    var cntsLength = getChars(theLabel);
//                    var visibleChar = getVisible(theLabel);
//                    while (cntsLength != visibleChar) {
//                        scaleDownText(theLabel);
//                        visibleChar = getVisible(theLabel);
//                    }

                    // Convert the area text to a new point text and align vertically.
                    // Note that due to an Adobe bug this doesn't work right: newLabel = theLabel.convertAreaObjectToPointObject();
                    // It does create the point text, but doesn't change the object parameter or return the new textitem.

                    var rowCount = theLabel.lines.length;
                    var fontSize = theLabel.textRange.characterAttributes.size;
                    var rowHeight = theLabel.textRange.characterAttributes.leading;
                    // now align the resulting text vertically to the desired text vertical-center point we stored above
                    deltaX = 0;
                    deltaY = textY - (theLabel.top - ((fontSize + ((rowCount - 1) * rowHeight)) / 2));
                    theLabel.translate(deltaX, deltaY);

                    // We convert to a point text as the last thing - just because point text is easier to deal with when editing in AI
                    theLabel.convertAreaObjectToPointObject();
                }
            }
            catch (e) {
            }
        }
    }
    catch (e) {
    }
}

function placeImage(theLayer, imageFile) {
    var newImage;
    var imageRect;
    var imagePathFile = idoc.path + imageFile;
    var image = File(imagePathFile);

    // place the image so that it fits in the rectangle specified by imageSymbol

    newImage = theLayer.placedItems.add();
    newImage.name = id;
    newImage.file = image;

    // Size the image to the width of rect - scale1 has already been applied when the imageSymbol was placed
    imageRect = theLayer.pathItems[0];
    var aspectRatio = newImage.width / newImage.height;
    newImage.width = imageRect.width;
    newImage.height = newImage.width / aspectRatio;

    // Set the position
    newImage.left = imageRect.left;
    newImage.top = imageRect.top;

    // Copy the opacity value from the rectangle
    newImage.opacity = imageRect.opacity;

    // Now delete the rectangle as it's served it's purpose
    imageRect.remove();

    return newImage;
}

function placeLinkSymbol(theLayer) {
    var item;
    var symbol;
    var newUNOLayer, linkLayer;
    var linkCenter;

    // Place the linkSymbol - named in ooosymbol - and break it out
    if ((symbol = getSymbol(ooosymbol)) != null) {
        theSymbol = theLayer.symbolItems.add(symbol);

        // Now break the symbol into it's component layers - and find the new UNO layers and rename them to the unoID
        theSymbol.breakLink();
        newUNOLayer = theLayer.layers.getByName(ooosymbol);
        newUNOLayer.name = id;
    }
    else {
        alert('Could not find the symbol: ' + name);
        return null;
    }

    // Get & delete the routing algorithm - must be the top-most thing in the linkSymbol - set the global routing variable
    routing = newUNOLayer.textFrames[0].contents;
    newUNOLayer.textFrames.removeAll();

    // Look to see if the link is in the UNO-sss, xxx-sss, or vvv-sss
    // The presence of a text item (which should be the link style name) means we should create the link in that layer
    linkLayer = newUNOLayer.layers.getByName("sss");
    if(linkLayer != null) {
        if(linkLayer.textFrames.length > 0){
            linkCenter = setupLink(linkLayer);
        }
    }
    linkLayer = newUNOLayer.layers.getByName("xxx");
    if(linkLayer != null) {
        linkLayer = linkLayer.layers.getByName("sss");
        if(linkLayer != null) {
            if (linkLayer.textFrames.length > 0) {
                linkCenter = setupLink(linkLayer);
            }
        }
    }
    linkLayer = newUNOLayer.layers.getByName("vvv");
    if(linkLayer != null) {
        linkLayer = linkLayer.layers.getByName("sss");
        if(linkLayer != null) {
            if (linkLayer.textFrames.length > 0) {
                linkCenter = setupLink(linkLayer);
            }
        }
    }


    // If the there are ooo pathItems or symbols, scale and move them into place
    var theItem;
    var oooLayer = newUNOLayer.layers.getByName("ooo");
    if (oooLayer != null){
        for(item=0; item < oooLayer.pathItems.length; item++){
            theItem = oooLayer.pathItems[item];
            theItem.resize(100*scale1,100*scale1);
            theItem.left = linkCenter[0] - (theItem.width / 2);
            theItem.top  = linkCenter[1] + (theItem.height / 2);
        }
        for(item=0; item < oooLayer.symbolItems.length; item++){
            theItem = oooLayer.symbolItems[item];
            theItem.resize(100*scale1,100*scale1);
            theItem.left = linkCenter[0] - (theItem.width / 2);
            theItem.top  = linkCenter[1] + (theItem.height / 2);
        }
        for(item=0; item < oooLayer.groupItems.length; item++){
            theItem = oooLayer.groupItems[item];
            theItem.resize(100*scale1,100*scale1);
            theItem.left = linkCenter[0] - (theItem.width / 2);
            theItem.top  = linkCenter[1] + (theItem.height / 2);
        }
    }


    // Set the UNO label object, then move it into place
    setLabel(newUNOLayer);
    var labelLayer = newUNOLayer.layers.getByName("sss class:label");
    if (labelLayer != null){
        if(labelLayer.textFrames.length > 0){
            var theLabel = labelLayer.textFrames[0];
            if(theLabel != null){
                // Set the label, scale it's size, then scale it's stroke (if it has one) - if possible
                // theLabel.contents = label;
                // theLabel.resize(100*scale1,100*scale1);
                // TODO figure out if we can scale type with an added stroke
                // theLabel.strokeWeight *= scale1;
                // theLabel.left = linkCenter[0] - (theLabel.width / 2);
                // theLabel.top  = linkCenter[1] + (theLabel.height / 2);
                theLabel.left -= theLabel.anchor[0] - linkCenter[0];
                theLabel.top  -= theLabel.anchor[1] - linkCenter[1];
            }
        }
    }

    return newUNOLayer;
}

// setupLink returns the point (2 number array) along the link where the ooo and label should go

function setupLink(linkLayer) {
    var i, x, y;
    var scaleMatrix;
    var labelPoint;
    var deltaX = 0;
    var deltaY = 0;
    var linkStyle;
    var theLabel;

    // Get & delete the link's graphic style, and get the label.  There should be at most 2 textFrames in the layer
    if(linkLayer.textFrames.length == 0) {
        alert('Missing link style text frame');
        return null;
    }
    else if(linkLayer.textFrames.length == 1) {
        linkStyle = linkLayer.textFrames[0].contents;
    }
    else if(linkLayer.textFrames.length == 2){
        linkStyle = linkLayer.textFrames[0].contents;
        theLabel = linkLayer.textFrames[1];
        }
    linkLayer.textFrames[0].remove();

    // Place a link For zero offsets, the masks could be points - we've already checked that these exist
    // Use the new method of doing offsets - using the ooo's of unoa and unob as the masks - set in the main prog loop.
    // var fromMask = linkLayer.pathItems[1];
    // var toMask =   linkLayer.pathItems[0];

    // The default offset method is a rectangle - unless the mask object is given the name 'Ellipse'
    if (fromMask.name == "Ellipse") { startKind = "Ellipse"; }
    else { startKind = "Rectangle"; }

    if (toMask.name == "Ellipse") { endKind = "Ellipse"; }
    else { endKind = "Rectangle"; }

    // Set the offsets that doOffsets() will use
    startOffsetX = fromMask.width / 2;
    startOffsetY = fromMask.height / 2;
    endOffsetX = toMask.width / 2;
    endOffsetY = toMask.height / 2;

    // Setup the link according to the line routing algorithm
    labelPoint = placeLine(linkLayer, linkStyle, routing, scale1);


    // LABEL STUFF -----------------------------------------------------------------------------
    // Set the label in the current layer - if there is one - and bring to front
    if(theLabel != null) {

        if (labelPoint != null) {
            labelx = labelPoint[0];
            labely = labelPoint[1];
        }

        theLabel.contents = label;
        theLabel.zOrder(ZOrderMethod.BRINGTOFRONT);

        // If it's an area text frame, then we adjust the text to fit and the vertically center it
        if(theLabel.kind == TextType.AREATEXT || theLabel.kind == TextType.PATHTEXT){
            // Store the desired vertical-center point of the text
            textY = theLabel.top - (theLabel.height/2);

            // Handle the case where there is unset text in a frame: shrink the text size until all the text fits in the text frame
            var cntsLength = getChars(theLabel);
            var visibleChar = getVisible(theLabel);
            while (cntsLength != visibleChar) {
                scaleDownText(theLabel);
                visibleChar = getVisible(theLabel);
            }

            // Convert the area text to a new point text and align vertically.
            // Note that due to an Adobe bug this doesn't work right: newLabel = theLabel.convertAreaObjectToPointObject();
            // It does create the point text, but doesn't change the object parameter or return the new textitem.
            // AND AND AND the postioning of the converted text is screwed up - I can't get the text to reposition.

            var rowCount = theLabel.lines.length;
            var fontSize = theLabel.textRange.characterAttributes.size;
            var rowHeight = theLabel.textRange.characterAttributes.leading;
            // now align the resulting text vertically to the desired text vertical-center point we stored above
            deltaY = textY - (theLabel.top - ((fontSize + ((rowCount - 1) * rowHeight)) / 2));
            theLabel.translate(deltaX, deltaY);

            // We convert to a point text - just because point text is easier to deal with when editing in AI
            theLabel.convertAreaObjectToPointObject();
        }

        // Scale and reposition it
        theLabel.resize(100*scale1,100*scale1);
        theLabel.position = [labelPoint[0] - (theLabel.width / 2), labelPoint[1] + (theLabel.height / 2)];
    }

    // If the there are ooo pathItems - other than the link line, which should be at the back (hence the pathItems.length - 1 )
    // – or symbols or groups, scale and move them into place
    var item, theItem;
    for(item=0; item < linkLayer.pathItems.length - 1; item++){
        theItem = linkLayer.pathItems[item];
        theItem.resize(100*scale1,100*scale1);
        theItem.left = labelPoint[0] - (theItem.width / 2);
        theItem.top  = labelPoint[1] + (theItem.height / 2);
    }
    for(item=0; item < linkLayer.symbolItems.length; item++){
        theItem = linkLayer.symbolItems[item];
        theItem.resize(100*scale1,100*scale1);
        theItem.left = labelPoint[0] - (theItem.width / 2);
        theItem.top  = labelPoint[1] + (theItem.height / 2);
    }
    for(item=0; item < linkLayer.groupItems.length; item++){
        theItem = linkLayer.groupItems[item];
        theItem.resize(100*scale1,100*scale1);
        theItem.left = labelPoint[0] - (theItem.width / 2);
        theItem.top  = labelPoint[1] + (theItem.height / 2);
    }

    return [labelPoint[0], labelPoint[1]];
}

function placeLine(theLayer, stylename, routing, theScale) {
    var labelHere;
    var twoPoints = [[],[]];
    twoPoints[0][0] = fromPoint[0];
    twoPoints[0][1] = fromPoint[1];
    twoPoints[1][0] = toPoint[0];
    twoPoints[1][1] = toPoint[1];

    var routingParams = routing.split(",");

    // if the stylename is blank then we do nothing -  the stylename is the switch for whether we draw a link in theLayer
    if (stylename != "") {

        // Get the style from this or the standards doc
        var graphicStyle = getGraphicStyle(stylename);

        if (graphicStyle != null) {
            // Draw the line using the specified line-routing function / algorithm

            if(routingParams[0] == "Arc") {
                labelHere = drawArc(theLayer, graphicStyle, twoPoints, theScale, routingParams[1], Number(routingParams[2]) );
            }
            else if (routing == '2point') {
                labelHere = draw2point(theLayer, graphicStyle, twoPoints, theScale);
            }
            else if (routing == '3pointH') {
                labelHere = draw3pointH(theLayer, graphicStyle, twoPoints, theScale);
            }
            else if (routing == '3pointV') {
                labelHere = draw3pointV(theLayer, graphicStyle, twoPoints, theScale);
            }
            else if (routing == '4pointH') {
                labelHere = draw4pointH(theLayer, graphicStyle, twoPoints, theScale);
            }
            else if (routing == '4pointV') {
                labelHere = draw4pointV(theLayer, graphicStyle, twoPoints, theScale);
            }
            else{
                alert('Unsupported link routing algorithm: ' + routing );
                return null;
            }

            return labelHere;
        }
        else {
            alert('Could not find the link graphic style: ' + linkStyle + " in this or the standards file.");
            return null;
        }
    }
    return null;
}


// LINE ROUTING ALGORITHMS --------------------------------------------
// Note that due to limitations of the Illustrator scripting DOM, the stroke width scale multiplier can access one stroke value per path.
// You can apply graphic styles with multiple strokes, but the script DOM can only access the one at the bottom of the staking order.
// All routers return a single x, y array - the point to place a label.

function draw2point(lineLayer, thisStyle, thePoints, s) {
    var thePath;
    var lpt = [];
    var offsetPoints;

    offsetPoints = doOffsets(thePoints);
    thePoints[0][0] = offsetPoints[0];
    thePoints[0][1] = offsetPoints[1];
    thePoints[1][0] = offsetPoints[2];
    thePoints[1][1] = offsetPoints[3];

    thePath = lineLayer.pathItems.add();
    thePath.setEntirePath(thePoints);
    thisStyle.applyTo(thePath);
    thePath.strokeWidth = thePath.strokeWidth * s;

    // If the opacity value is less than 1.0, then adjust the opacity - otherwise use the Symbol/Style opacity
    if(oooOpacity < 1.0){
        thePath.opacity = oooOpacity * 100;
    }

    thePath.zOrder(ZOrderMethod.SENDTOBACK);

    lpt[0] = thePoints[0][0] + ((thePoints[1][0] - thePoints[0][0]) / 2);
    lpt[1] = thePoints[0][1] + ((thePoints[1][1] - thePoints[0][1]) / 2);
    return lpt;
}

function draw3pointH(lineLayer, thisStyle, thePoints, s) {
    var thePath;
    var threePoints = [];
    var lpt = [];
    var offsetPoints = [];

    // Set up for three points - make the middle point
    threePoints[0] = thePoints[0];
    threePoints[1] = [0, 0];
    threePoints[2] = thePoints[1];

    // Calculate the middle point
    threePoints[1][0] = thePoints[0][0] + (thePoints[1][0] - thePoints[0][0]) / 2;
    threePoints[1][1] = thePoints[1][1];

    // For the Out the point, use the last 2 points - only the second point will be changed by doOffsets
    thePoints[0] = threePoints[1];
    thePoints[1] = threePoints[2];
    offsetPoints = doOffsets(thePoints);
    threePoints[2][0] = offsetPoints[2];
    threePoints[2][1] = offsetPoints[3];

    // For the In the point, use the first 2 points - only the first point will be changed by doOffsets
    thePoints[0] = threePoints[0];
    thePoints[1] = threePoints[1];
    offsetPoints = doOffsets(thePoints);
    threePoints[0][0] = offsetPoints[0];
    threePoints[0][1] = offsetPoints[1];

    // Create the line
    thePath = lineLayer.pathItems.add();
    thePath.setEntirePath(threePoints);
    thisStyle.applyTo(thePath);
    thePath.strokeWidth = thePath.strokeWidth * s;
    // If the opacity value is less than 1.0, then adjust the opacity - otherwise use the Symbol/Style opacity
    if(oooOpacity < 1.0){
        thePath.opacity = oooOpacity * 100;
    }

    thePath.zOrder(ZOrderMethod.SENDTOBACK);

    // Set the label point to the middle point
    lpt[0] = threePoints[1][0];
    lpt[1] = threePoints[1][1];
    return lpt;
}

function draw3pointV(lineLayer, thisStyle, thePoints, s) {
    var thePath;
    var threePoints = [];
    var lpt = [];
    var offsetPoints;

    // Set up for three points - make the middle point
    threePoints[0] = thePoints[0];
    threePoints[1] = [0, 0];
    threePoints[2] = thePoints[1];
    // Calculate the middle point
    threePoints[1][1] = thePoints[0][1] + (thePoints[1][1] - thePoints[0][1]) / 2;
    threePoints[1][0] = thePoints[1][0];

    //Do the offsets

    // For the Out the point, use the last 2 points - only the second point changed by doOffsets
    thePoints[0] = threePoints[1];
    thePoints[1] = threePoints[2];
    offsetPoints = doOffsets(thePoints);
    threePoints[2][0] = offsetPoints[2];
    threePoints[2][1] = offsetPoints[3];

    // For the In the point, use the first 2 points - only the first point changed by doOffsets
    thePoints[0] = threePoints[0];
    thePoints[1] = threePoints[1];
    offsetPoints = doOffsets(thePoints);
    threePoints[0][0] = offsetPoints[0];
    threePoints[0][1] = offsetPoints[1];

    // Create the line
    thePath = lineLayer.pathItems.add();
    thePath.setEntirePath(threePoints);
    thisStyle.applyTo(thePath);
    thePath.strokeWidth = thePath.strokeWidth * s;
    // If the opacity value is less than 1.0, then adjust the opacity - otherwise use the Symbol/Style opacity
    if(oooOpacity < 1.0){
        thePath.opacity = oooOpacity * 100;
    }

    thePath.zOrder(ZOrderMethod.SENDTOBACK);

    // Set the label point to the middle point
    lpt[0] = threePoints[1][0];
    lpt[1] = threePoints[1][1];
    return lpt;
}

function draw4pointH(lineLayer, thisStyle, thePoints, s) {
    var thePath;
    var fourPoints = [];
    var lpt = [];
    var offsetPoints;

    // Set up for four points - create the 2 middle points
    fourPoints[0] = thePoints[0];
    fourPoints[1] = [0, 0];
    fourPoints[2] = [0, 0];
    fourPoints[3] = thePoints[1];

    // Calculate the middle points
    fourPoints[1][0] = thePoints[0][0] + (thePoints[1][0] - thePoints[0][0]) / 2;
    fourPoints[1][1] = thePoints[0][1];
    fourPoints[2][0] = fourPoints[1][0];
    fourPoints[2][1] = thePoints[1][1];

    //Do the offsets
    // Use the first 2 points - only the first point will be changed by doOffsets
    thePoints[0] = fourPoints[0];
    thePoints[1] = fourPoints[1];
    offsetPoints = doOffsets(thePoints);
    fourPoints[0][0] = offsetPoints[0];
    fourPoints[0][1] = offsetPoints[1];

    // Use the last 2 points - only the second point will be changed by doOffsets
    thePoints[0] = fourPoints[2];
    thePoints[1] = fourPoints[3];
    offsetPoints = doOffsets(thePoints);
    fourPoints[3][0] = offsetPoints[2];
    fourPoints[3][1] = offsetPoints[3];

    // Create the line
    thePath = lineLayer.pathItems.add();
    thePath.setEntirePath(fourPoints);
    thisStyle.applyTo(thePath);
    thePath.strokeWidth = thePath.strokeWidth * s;
    // If the opacity value is less than 1.0, then adjust the opacity - otherwise use the Symbol/Style opacity
    if(oooOpacity < 1.0){
        thePath.opacity = oooOpacity * 100;
    }

    thePath.zOrder(ZOrderMethod.SENDTOBACK);

    // Set the label point to the 3rd point
    lpt[0] = fourPoints[2][0];
    lpt[1] = fourPoints[2][1];
    return lpt;
}

// TODO figure out why the from offset point is 180˚ off - or the y offset sign is wrong

function draw4pointV(lineLayer, thisStyle, thePoints, s) {
    var thePath;
    var fourPoints = [];
    var lpt = [];
    var offsetPoints;

    // Set up for three points - make the 2 middle points
    fourPoints[0] = thePoints[0];
    fourPoints[1] = [0, 0];
    fourPoints[2] = [0, 0];
    fourPoints[3] = thePoints[1];

    // Calculate the middle points
    fourPoints[1][1] = thePoints[0][1] + (thePoints[1][1] - thePoints[0][1]) / 2;
    fourPoints[1][0] = thePoints[0][0];
    fourPoints[2][1] = fourPoints[1][1];
    fourPoints[2][0] = thePoints[1][0];

    //Do the offsets

    // Use the first 2 points - only the first point will be changed by doOffsets
    thePoints[0] = fourPoints[0];
    thePoints[1] = fourPoints[1];
    offsetPoints = doOffsets(thePoints);
    fourPoints[0][0] = offsetPoints[0];
    fourPoints[0][1] = offsetPoints[1];

    // Use the last 2 points - only the second point will be changed by doOffsets
    thePoints[0] = fourPoints[2];
    thePoints[1] = fourPoints[3];
    offsetPoints = doOffsets(thePoints);
    fourPoints[3][0] = offsetPoints[2];
    fourPoints[3][1] = offsetPoints[3];

    // Create the line
    thePath = lineLayer.pathItems.add();
    thePath.setEntirePath(fourPoints);
    thisStyle.applyTo(thePath);
    thePath.strokeWidth = thePath.strokeWidth * s;
    // If the opacity value is less than 1.0, then adjust the opacity - otherwise use the Symbol/Style opacity
    if(oooOpacity < 1.0){
        thePath.opacity = oooOpacity * 100;
    }

    thePath.zOrder(ZOrderMethod.SENDTOBACK);

    // Set the label point to the 3rd point
    lpt[0] = fourPoints[2][0];
    lpt[1] = fourPoints[2][1];
    return lpt;
}

function drawArc(lineLayer, thisStyle, thePoints, s, direction, eccentricity) {
    var thePath;
    var threePoints = [[0,0],[0,0],[0,0]];
    var lpt = [];
    var offsetPoints;
    var radius = eccentricity;
    var chordLength;
    var saggita;
    var theta;
    var offsetX;
    var offsetY;

    // Set up for three points - make the middle point
    threePoints[0][0] = thePoints[0][0];
    threePoints[0][1] = thePoints[0][1];
    threePoints[1] = [0, 0];
    threePoints[2][0] = thePoints[1][0];
    threePoints[2][1] = thePoints[1][1];

    // Calculate the middle point
    var deltaX = (thePoints[1][0] - thePoints[0][0]) / 2;
    var deltaY = (thePoints[1][1] - thePoints[0][1]) / 2;
    threePoints[1][0] = thePoints[0][0] + deltaX;
    threePoints[1][1] = thePoints[0][1] + deltaY;

    // Arcs are calculated in 2 different ways: by an eccentricity value (if eccentricity is <= 2), or as a set radius (if eccentricity > 2)
    if(radius <= 2){
        if(direction == "CW"){
            threePoints[1][0] -= deltaY * eccentricity;
            threePoints[1][1] += deltaX * eccentricity;
        }
        else {
            threePoints[1][0] += deltaY * eccentricity;
            threePoints[1][1] -= deltaX * eccentricity;
        }
    }
    else {
        // We need an eccentricity value for our other calculations, so we estimate one
        chordLength = Math.sqrt( Math.pow(deltaX * 2, 2) + Math.pow(deltaY * 2, 2) );
        eccentricity = chordLength / (radius * 2);
    }


    // Do the offsets --------------------------------------------------------------------------------------------------
    // Because of the curving link we need to kludge the offsets by moving the middle point 'out' more that normal via the eccentricity * 1.5
    // For the Out the point, use the last 2 points - only the second point will be changed by doOffsets
    if(direction == "CW"){
        thePoints[0][0] = threePoints[1][0] - deltaY * eccentricity * 1.5;
        thePoints[0][1] = threePoints[1][1] + deltaX * eccentricity * 1.5;
    }
    else {
        thePoints[0][0] = threePoints[1][0] + deltaY * eccentricity * 1.5;
        thePoints[0][1] = threePoints[1][1] - deltaX * eccentricity * 1.5;
    }
    thePoints[1][0] = threePoints[2][0];
    thePoints[1][1] = threePoints[2][1];
    offsetPoints = doOffsets(thePoints);
    threePoints[2][0] = offsetPoints[2];
    threePoints[2][1] = offsetPoints[3];

    // For the In the point, use the first 2 points - only the first point will be changed by doOffsets
    thePoints[0][0] = threePoints[0][0];
    thePoints[0][1] = threePoints[0][1];
    if(direction == "CW"){
        thePoints[1][0] = threePoints[1][0] - deltaY * eccentricity * 1.5;
        thePoints[1][1] = threePoints[1][1] + deltaX * eccentricity * 1.5;
    }
    else {
        thePoints[1][0] = threePoints[1][0] + deltaY * eccentricity * 1.5;
        thePoints[1][1] = threePoints[1][1] - deltaX * eccentricity * 1.5;
    }
    offsetPoints = doOffsets(thePoints);
    threePoints[0][0] = offsetPoints[0];
    threePoints[0][1] = offsetPoints[1];

    // Move the middle point - based on the now trimmed line -----------------------------------------------------------
    // Re-calculate the middle point
    deltaX = (threePoints[2][0] - threePoints[0][0]) / 2;
    deltaY = (threePoints[2][1] - threePoints[0][1]) / 2;
    threePoints[1][0] = threePoints[0][0] + deltaX;
    threePoints[1][1] = threePoints[0][1] + deltaY;

    if(radius <= 2){
        chordLength = Math.sqrt( Math.pow(deltaX * 2, 2) + Math.pow(deltaY * 2, 2) );
        saggita = eccentricity * chordLength / 2;
        theta = Math.atan( deltaY / deltaX );
        offsetX = Math.sin(theta) * saggita;
        offsetY = Math.cos(theta) * saggita;
    }
    else {
        // eccentricity is used as the radius (in points) of the arc - we need to find the saggita length = the distance to move the middle point
        chordLength = Math.sqrt( Math.pow(deltaX * 2, 2) + Math.pow(deltaY * 2, 2) );
        saggita = radius - Math.sqrt( Math.abs(Math.pow(radius, 2) - Math.pow(chordLength / 2, 2)) );
        theta = Math.atan( deltaY / deltaX );
        offsetX = Math.sin(theta) * saggita;
        offsetY = Math.cos(theta) * saggita;
    }

    // Reverse the signs depending on the phase quadrant

    if(deltaX < 0 && deltaY >= 0){
        offsetX = -offsetX;
        offsetY = -offsetY;
    }
    else if(deltaX < 0 && deltaY < 0){
        offsetX = -offsetX;
        offsetY = -offsetY;
    }
    else if(deltaX >= 0 && deltaY < 0){
        offsetX = offsetX;
        offsetY = offsetY;
    }

    if(direction == "CW"){
        threePoints[1][0] -= offsetX;
        threePoints[1][1] += offsetY;
    }
    else {
        threePoints[1][0] += offsetX;
        threePoints[1][1] -= offsetY;
    }

    // Create the line -------------------------------------------------------------------------------------------------
    thePath = lineLayer.pathItems.add();
    thePath.setEntirePath(threePoints);
    thisStyle.applyTo(thePath);
    thePath.strokeWidth = thePath.strokeWidth * s;
    // If the opacity value is less than 1.0, then adjust the opacity - otherwise use the Symbol/Style opacity
    if(oooOpacity < 1.0){
        thePath.opacity = oooOpacity * 100;
    }

    thePath.zOrder(ZOrderMethod.SENDTOBACK);

    // Bend the middle point - add the handles - applying the handle multiplier
    thePath.pathPoints[1].pointType = PointType.SMOOTH;
    // The 0.8 is a kludge adjustment - not sure why....  The rest of the calculation was rough-figured from examples.
    var handleMultiplier = 0.8 * eccentricity * ((0.5/eccentricity)+0.5)-(0.06*eccentricity);
    var handlePoint = Array(0,0);
    handlePoint[0] = thePath.pathPoints[1].anchor[0] + deltaX * handleMultiplier;
    handlePoint[1] = thePath.pathPoints[1].anchor[1] + deltaY * handleMultiplier;
    thePath.pathPoints[1].rightDirection = handlePoint;
    handlePoint[0] = thePath.pathPoints[1].anchor[0] - deltaX * handleMultiplier;
    handlePoint[1] = thePath.pathPoints[1].anchor[1] - deltaY * handleMultiplier;
    thePath.pathPoints[1].leftDirection  = handlePoint;

    // Set the label point to the middle point
    lpt[0] = threePoints[1][0];
    lpt[1] = threePoints[1][1];
    return lpt;
}


function doOffsets(thePoints) {
    var endPointx;
    var endPointy;
    var startPointx;
    var startPointy;
    var epointx;
    var epointy;
    var a;
    var b;
    var alpha;
    var omega;
    var theta;
    var deltaX;
    var deltaY;

    // And the globals for the start/endKind, and start/endOffset

    // We'll offset the either the endPoint (for unob) and/or the startPoint (for unoa)
    // For the ellipse equation see: http://math.stackexchange.com/questions/22064/calculating-a-point-that-lies-on-an-ellipse-given-an-angle

    if (endOffsetX + endOffsetY == 0) {
        // Leave the endPoint as is
        endPointx = thePoints[1][0];
        endPointy = thePoints[1][1];
    }
    else {
        // The angle of the line is theta
        deltaX = thePoints[1][0] - thePoints[0][0];
        deltaY = thePoints[1][1] - thePoints[0][1];
        omega = Math.atan(deltaY / deltaX);
        // Correct theta to be -CW below the y axis, and +CCW above the y axis
        if (deltaX > 0) {
            if (omega < 0) {
                theta = Math.PI + omega;
            }
            else {
                theta = -Math.PI + omega;
            }
        }
        else {
            theta = omega;
        }

        // Offsets for unoB (the end point) - add the endOffset
        a = endOffsetX;
        b = endOffsetY;

        if (endKind == "Ellipse") {
            // An ellipse with the x and y axis 2a and 2b
            epointx = (a * b) / (  Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2) * Math.pow(Math.tan(omega), 2)) );
            epointy = (a * b * Math.tan(omega)) / (  Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2) * Math.pow(Math.tan(omega), 2)) );

            if (deltaX < 0) {
                endPointx = thePoints[1][0] + epointx;
                endPointy = thePoints[1][1] + epointy;
            }
            else {
                endPointx = thePoints[1][0] - epointx;
                endPointy = thePoints[1][1] - epointy;
            }
        }
        // TODO - there's some kinda problem with with rect's - the offset varies with angle - infinie at horiz-right, 0 at vert-down (I think).
        else if (endKind == "Rectangle") {
            // alpha = the angle to the corner of the rectangle
            alpha = Math.atan(endOffsetY / endOffsetX);

            // An rectangle with the width and height of 2a and 2b
            // For the rectangle coordinate equation see: http://stackoverflow.com/questions/4061576/finding-points-on-a-rectangle-at-a-given-angle
            // We have to account for the sign of the tan in the 4 quadrants (deltaY +/-, deltaX +/-), and if the theta is > or < alpha

            if (deltaY >= 0) {
                if (deltaX < 0) {
                    if (theta > (-alpha)) {
                        endPointx = thePoints[1][0] + a;
                        endPointy = thePoints[1][1] + a * Math.tan(theta);
                    }
                    else {
                        endPointx = thePoints[1][0] - (2 * b) / (2 * Math.tan(theta));
                        endPointy = thePoints[1][1] - b;
                    }
                }
                else {
                    if (theta <= (-Math.PI + alpha)) {
                        endPointx = thePoints[1][0] - a;
                        endPointy = thePoints[1][1] - a * Math.tan(theta);
                    }
                    else {
                        endPointx = thePoints[1][0] - (2 * b) / (2 * Math.tan(theta));
                        endPointy = thePoints[1][1] - b;
                    }
                }
            }
            else {
                if (deltaX >= 0) {
                    if (theta > (Math.PI - alpha)) {
                        endPointx = thePoints[1][0] - a;
                        endPointy = thePoints[1][1] - a * Math.tan(theta);
                    }
                    else {
                        endPointx = thePoints[1][0] + (2 * b) / (2 * Math.tan(theta));
                        endPointy = thePoints[1][1] + b;
                    }
                }
                else {
                    if (theta <= alpha) {
                        endPointx = thePoints[1][0] + a;
                        endPointy = thePoints[1][1] + a * Math.tan(theta);
                    }
                    else {
                        endPointx = thePoints[1][0] + (2 * b) / (2 * Math.tan(theta));
                        endPointy = thePoints[1][1] + b;
                    }
                }
            }
        }
    }

    if (startOffsetX + startOffsetY == 0) {
        // Leave the startPoint as is
        startPointx = thePoints[0][0];
        startPointy = thePoints[0][1];
    }
    else {
        // The angle of the line is theta
        deltaX = thePoints[0][0] - thePoints[1][0];
        deltaY = thePoints[0][1] - thePoints[1][1];
        omega = Math.atan(deltaY / deltaX);
        // Correct theta to be -CW below the y axis, and +CCW above the y axis
        if (deltaX > 0) {
            if (omega < 0) {
                theta = Math.PI + omega;
            }
            else {
                theta = -Math.PI + omega;
            }
        }
        else {
            theta =  Math.PI + omega;
        }

        // Offsets for unoA - the starting point
        a = startOffsetX;
        b = startOffsetY;

        // $.write(deltaX + "\t" + deltaY + "\t" + theta + "\t" + omega + "\r");

        if (startKind == "Ellipse") {
            // An ellipse with the x and y axis 2a and 2b
            epointx = (a * b) / (  Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2) * Math.pow(Math.tan(omega), 2)) );
            epointy = (a * b * Math.tan(omega)) / (  Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2) * Math.pow(Math.tan(omega), 2)) );

            if (deltaX >= 0) {
                startPointx = thePoints[0][0] - epointx;
                startPointy = thePoints[0][1] - epointy;
            }
            else {
                startPointx = thePoints[0][0] + epointx;
                startPointy = thePoints[0][1] + epointy;
            }
        }
        else if (startKind == "Rectangle") {
            // the angle to the corner of the rectangle
            alpha = Math.atan(startOffsetY / startOffsetX);

            // An rectangle with the width and height of 2a and 2b
            // For the rectangle coordinate equation see: http://stackoverflow.com/questions/4061576/finding-points-on-a-rectangle-at-a-given-angle
            // We have to account for the sign of the tan in the 4 quadrants (deltaY x deltaX), and if the theta is > or < alpha
            // 09/16/2017 - corrected a bug: changed theta to omega in these if statements
            //        if (theta > (-alpha)) {
            //        if (theta <= alpha) {

            if (deltaY >= 0) {
                if (deltaX < 0) {
                    if (omega > (-alpha)) {
                        startPointx = thePoints[0][0] + a;
                        startPointy = thePoints[0][1] + a * Math.tan(theta);
                    }
                    else {
                        startPointx = thePoints[0][0] - (2 * b) / (2 * Math.tan(theta));
                        startPointy = thePoints[0][1] - b;
                    }
                }
                else {
                    if (theta <= (-Math.PI + alpha)) {
                        startPointx = thePoints[0][0] - a;
                        startPointy = thePoints[0][1] - a * Math.tan(theta);
                    }
                    else {
                        startPointx = thePoints[0][0] - (2 * b) / (2 * Math.tan(theta));
                        startPointy = thePoints[0][1] - b;
                    }
                }
            }
            else {
                if (deltaX >= 0) {
                    if (theta > (Math.PI - alpha)) {
                        startPointx = thePoints[0][0] - a;
                        startPointy = thePoints[0][1] - a * Math.tan(theta);
                    }
                    else {
                        startPointx = thePoints[0][0] + (2 * b) / (2 * Math.tan(theta));
                        startPointy = thePoints[0][1] + b;
                    }
                }
                else {
                    if (omega <= alpha) {
                        startPointx = thePoints[0][0] + a;
                        startPointy = thePoints[0][1] + a * Math.tan(theta);
                    }
                    else {
                        startPointx = thePoints[0][0] + (2 * b) / (2 * Math.tan(theta));
                        startPointy = thePoints[0][1] + b;
                    }
                }
            }
        }
    }

    return [startPointx, startPointy, endPointx, endPointy];
}





// Create an array object from reading-in a CSV file

function CSVobject(fileObj) {
    var csvArray = [];
    var rownum = 0;

    if (fileObj.exists) {
        fileObj.open('r');

        while (!fileObj.eof) {
            var thisLine = fileObj.readln();
            var valueArray = thisLine.split(',');
            // only push to the next row if we've filled row 0
            if (rownum == 0) {
                csvArray[0] = valueArray;
            }
            else {
                csvArray.push(valueArray);
            }
            rownum++;
        }

        fileObj.close();

        return ( csvArray );
    }
    else {
        alert("Error opening CSV file: " + fileObj.name);
        return null;
    }
}

function degrees2rads(deg) {
    return deg * Math.PI / 180;
}

// Returns the cell value for row 'row' and the column that that matches 'name'
function getCellbyHeader(csvArray, row, name) {
    var numcols = csvArray[0].length;
    var icol;
    for (icol = 0; icol < numcols; icol++) {
        var cellval = csvArray[0][icol];    // the 'Header' is the first row - find the column with the 'name'

        if (cellval == name) {
            return ( csvArray[row][icol] );  // return the value in row for that column
        }
    }
    return (null);
}

// Sets the cell value for row 'row' and the column that that matches 'name'
function setCellbyHeader(csvArray, row, name, value) {
    var numcols = csvArray[0].length;
    var icol;
    for (icol = 0; icol < numcols; icol++) {
        var cellval = csvArray[0][icol];    // the 'Header' is the first row - find the column with the 'name'

        if (cellval == name) {
            csvArray[row][icol] = value;
            return true;
        }
    }
    return (false);
}


// Convert from center point too upper-left corner
function centertoUL(xpos, ypos, width, height) {
    xpos = xpos - (width / 2);          // Correct for the upper-left corner offset
    ypos = (-ypos + (height / 2));      // Correct for the upper-left corner offset - and coordinate system - we switch the sigh of y pos here instead of in the spreadsheet
    return [xpos, ypos];
}

function checkID(aLayer, theName) {
    var layerNames;
    var unoName;
    // first we need to importLayer the UNO name from any " class:" designations
    layerNames = aLayer.name.split(" ");
    unoName = layerNames[0];
    if (unoName == theName) {    // We found it!
        return true;
    }
    else {
        return false;
    }
}

function getoooCoor(theLayer) {
    // Returns the center point of the first symbol in the ooo layer of theLayer
    var theSymbol, thePath;

    try {
        var theooo = theLayer.layers.getByName("ooo");
        // We only look for one - the first - symbol or path in the ooo
        if(theooo.symbolItems.length > 0){
            theSymbol = theooo.symbolItems[0];
            if (theSymbol != null) {
                var ptx = theSymbol.position[0] + (theSymbol.width / 2);
                var pty = theSymbol.position[1] - (theSymbol.height / 2);
                return [ptx, pty, theSymbol.width, theSymbol.height];
            }
        }
        else if(theooo.pathItems.length > 0) {
            thePath = theooo.pathItems[0];
            if (thePath != null) {
                var ptx = thePath.position[0] + (thePath.width / 2);
                var pty = thePath.position[1] - (thePath.height / 2);
                return [ptx, pty, thePath.width, thePath.height];
            }
        }
        else {
            alert('Could not find a symbol to center on in the ooo layer for: ' + theLayer.name);
            return null;
        }
    }
    catch (e) {
        alert('Could not find an ooo layer for: ' + theLayer.name);
        return null;
    }
}


function placeThing(theLayer, kind, name, x, y, w, h, opacity) {
    var symbol;
    var style;
    var theSymbol;
    var theThing;

    // if the name is blank then do nothing
    if (name != "") {
        if (kind == "symbol") {
            // if there is a symbol with that name, then place the symbol
            if ((symbol = getSymbol(name)) != null) {
                theSymbol = theLayer.symbolItems.add(symbol);
                theSymbol.width = w;
                theSymbol.height = h;
                theSymbol.position = [x, y];
                // If the opacity value is greater than 1.0, then do not adjust the opacity - just use the Symbol/Style opacity
                if(opacity < 1.0){
                    theSymbol.opacity = opacity * 100;
                }
            }
            else {
                alert('Could not find the symbol: ' + name);
                return null;
            }
        }
        else if (kind == "rect") {
            if ((style = getGraphicStyle(name)) != null) {
                // the ooox, oooy (just x and y here) are already converted to upper left corner coordinates
                theThing = theLayer.pathItems.rectangle(y, x, w, h);
                style.applyTo(theThing);
                // If the opacity value is greater than 1.0, then do not adjust the opacity - just use the Symbol/Style opacity
                if(opacity < 1.0){
                    theSymbol.opacity = opacity * 100;
                }
            }
            else {
                alert('Could not find the graphic style: ' + name);
                return null;
            }
        }
        else if (kind == "ellipse") {
            if ((style = getGraphicStyle(name)) != null) {
                // the ooox, oooy (just x and y here) are already converted to upper left corner coordinates
                theThing = theLayer.pathItems.ellipse(y, x, w, h);
                style.applyTo(theThing);
                // If the opacity value is greater than 1.0, then do not adjust the opacity - just use the Symbol/Style opacity
                if(opacity < 1.0){
                    theSymbol.opacity = opacity * 100;
                }
            }
            else {
                alert('Could not find the graphic style: ' + name);
                return null;
            }
        }
    }

    return( true );       // This is a soft fail - there was no symbol to place.
}

function getSymbol(name) {
    var foundSymbol;
    var tempSymbol;

    try {
        // first look for the symbol in the current doc
        foundSymbol = idoc.symbols.getByName(name);
        return foundSymbol;
    }
    catch (e) {
        // Couldn't find the symbol in the current doc, so now look in the standards doc
        try {
            foundSymbol = standardsDoc.symbols.getByName(name);
            // we must first transfer the symbol from the standards doc to this doc, then place it from this doc
            try {
                tempSymbol = standardsDoc.layers[0].symbolItems.add(foundSymbol);
            }
            catch (e) {
                alert('Could not add the symbol ' + name + ' to the layer ' + standardsDoc.layers[0].name + '  – make sure the layer is not locked.');
                return null;
            }
            standardsDoc.selection = null;
            tempSymbol.selected = true;
            app.activeDocument = standardsDoc;
            app.cut();
            app.activeDocument = idoc;
            app.paste();
            app.cut();
            foundSymbol = idoc.symbols.getByName(name);
            return foundSymbol;
        }
        catch (e) {
            alert('Could not find the symbol: ' + name);
            return null;
        }
    }
}

function placeLabel(theLayer, ltxt, labelInfo, scale) {
    if (ltxt != "") {
        var theLabel;
        var theStyle;
        var graphicStyle;
        var textBox;
        var coor;
        var deltaX;
        var deltaY;

        // Parse out the variables from labelParams
        var	place       = Number(labelInfo[0]);
        var	x           = Number(labelInfo[1]);
        var	y           = Number(labelInfo[2]);
        var	w           = Number(labelInfo[3]);
        var	h           = Number(labelInfo[4]);
        var	offsetx     = Number(labelInfo[5]);
        var	offsety     = Number(labelInfo[6]);
        var	pstyle      = labelInfo[7];
        var	size        = Number(labelInfo[8]);
        var	gstyle      = labelInfo[9];

        // Adjust the label offset position
        x += offsetx;
        y += offsety;

        if(place == 0) {    // 0 means do not place the label
            return;
        }

        if (pstyle != "") {
            // Look in the current doc for the style - if not found check the standards doc
            try {
                theStyle = idoc.paragraphStyles.getByName(pstyle);
            }
            catch (e) {
                try {
                    theStyle = standardsDoc.paragraphStyles.getByName(pstyle);
                }
                catch (e) {
                    if (theStyle == null) {
                        alert('Could not find the paragraph style: ' + pstyle);
                        return null;
                    }
                }
            }
        }

        // if place (lableKind) = 2, we'll create a text frame
        if (place == 2) {
            // translate the lable coordinates to the upper left corner
            coor = centertoUL(x, y, w, h);

            textBox = theLayer.pathItems.rectangle(coor[1], coor[0], w, h);
            theLabel = theLayer.textFrames.areaText(textBox);
            theLabel.contents = ltxt;

            // If there is a graphic style, we need to apply that first: before the paragraph style
            if (gstyle != "") {
                graphicStyle = getGraphicStyle(gstyle);
                if (graphicStyle != null) {
                    graphicStyle.applyTo(theLabel);
                }
            }

            // Apply the paragraph style
            if (theStyle != null) {
                // Paragraph styles can be applied from one doc to another (unlike symbols and graphic styles)
                theStyle.applyTo(theLabel.textRange, true);
            }

            // Now apply the font size
            theLabel.textRange.characterAttributes.size = size;
            // Adjust the baseline shift if the label's pstyle starts with "VC" - for VerticalCenter - which is -1/2.86 of the font size for Myriad Pro Semibold
            if (pstyle.search("VC") == 0) {
                theLabel.textRange.characterAttributes.baselineShift = -size / 2.86;
            }

            // Handle the case where there is unset text in a frame: shrink the text size until all the text fits in the text frame
            var cntsLength = getChars(theLabel);
            var visibleChar = getVisible(theLabel);
            while (cntsLength != visibleChar) {
                scaleDownText(theLabel);
                visibleChar = getVisible(theLabel);
            }

            // Convert the text to a point and back to area - so we can get h w measurement of the text so we can align it
            // We need to cut and paste it to update the text frame bounds to match the size of the text that's in the object
            theLabel.convertAreaObjectToPointObject();
            theLabel.convertPointObjectToAreaObject();
            idoc.selection = null;
            theLabel.selected = true;
            app.cut();
            app.paste();
            theLabel = idoc.selection[0];

            // now align the resulting text to the label center point
            // calculate how far the UL corner needs to move in order to align the center points
            deltaX = x - ( theLabel.left + (theLabel.width / 2));
            deltaY = -y - ( theLabel.top - (theLabel.height / 2));
            theLabel.translate(deltaX, deltaY);
        }
        else if (place == 1) {          // place point text
            theLabel = theLayer.textFrames.add();

            // After much mucking about, it seem that you can't set the textFrame's anchor or position directly (they must be read only,
            // despite what the documentation says), you can only use .left & .top which is not what we want
            // So we need to use the translate method
            theLabel.contents = ltxt;
            // y is minus because we haven't yet translated labelx, labely
            theLabel.translate(x, -y);

            // Apply the graphic stile  - if there is one, we need to apply that first: before the paragraph style to get it to work right
            if (gstyle != "") {
                graphicStyle = getGraphicStyle(gstyle);
                if (graphicStyle != null) {
                    graphicStyle.applyTo(theLabel);
                }
            }

            // Apply the paragraph style
            if (theStyle != null) {
                // Paragraph styles can be applied from one doc to another (unlike symbols and graphic styles)
                theStyle.applyTo(theLabel.textRange, true);
            }
            // Now apply the font size
            theLabel.textRange.characterAttributes.size = size;
            // Adjust the baseline shift if the label's pstyle starts with "VC" - for VerticalCenter - which is -1/2.86 of the font size for Myriad Pro Semibold
            if (pstyle.search("VC") == 0) {
                theLabel.textRange.characterAttributes.baselineShift = -size / 2.86;
            }
        }


        // scaleText is a global switch to control the renderer behavior
        // Apply the scale value to text size and baseline shift - if it's not 0 - and modify the stroke weight
        if (scaleText == true) {
            if (scale != 0) {
                theLabel.textRange.characterAttributes.size = theLabel.textRange.characterAttributes.size * scale;
                theLabel.textRange.characterAttributes.baselineShift = theLabel.textRange.characterAttributes.baselineShift * scale;
                // theLabel.strokeWeight = theLabel.strokeWeight * scale;    can't get at the Appearance values
            }
        }
    }
    return ( true );
}


function getVisible(txObj) {
    var result = 0;
    for (var i = 0; i < txObj.lines.length; i++) {
        result += txObj.lines[i].characters.length;
    }
    return result;
}

function getChars(txObj) {
    var result = 0;
    for (var i = 0; i < txObj.paragraphs.length; i++) {
        result += txObj.paragraphs[i].characters.length;
    }
    return result;
}

function scaleDownText(txObj) {
    var fontSize;

    // reduce the font size by 0.5 points
    for (var i = 0; i < txObj.paragraphs.length; i++) {
        fontSize = txObj.paragraphs[i].characterAttributes.size;
        if(fontSize > 1.5){
            txObj.paragraphs[i].characterAttributes.size = fontSize - 0.5;
        }
    }
}


function getGraphicStyle(name) {
    // Returns the graphic style named 'name'
    // If the style is not found in the current document, it is imported from standardsDoc

    var foundStyle;

    try {
        // first look for the graphic style in the current doc
        foundStyle = idoc.graphicStyles.getByName(name);
        return foundStyle;
    }
    catch (e) {
        // Couldn't find the graphic style in the current doc, so now look in the standards doc
        try {
            foundStyle = standardsDoc.graphicStyles.getByName(name);

            // we must first transfer the graphic style from the standards doc to this doc, then apply it from this doc
            var tempPath = standardsDoc.layers[0].pathItems.add();
            var point = [];
            point[0] = [0, 0];
            tempPath.setEntirePath(point);
            foundStyle.applyTo(tempPath);
            standardsDoc.selected = false;
            tempPath.selected = true;
            app.activeDocument = standardsDoc;
            app.cut();
            app.activeDocument = idoc;
            app.paste();
            app.cut();

            foundStyle = idoc.graphicStyles.getByName(name);
            return foundStyle;
        }
        catch (e) {
            alert('Could not find the graphic style: ' + name + ' – in either this document or in the standards document.');
            return null;
        }
    }
}

// Select all pageItems 6 sublayers deep for the layer
function selectAll(theLayer) {
    var currentItem;
    var i;

    // Make sure nothing is selected
    app.executeMenuCommand("deselectall");

    // (for good measure) Select anything in the UNO layer (shouldn't be anything here)
    for (i = 0; i < theLayer.pageItems.length; i++) {
        currentItem = theLayer.pageItems[i];
        currentItem.selected = true
    }

    // Walk through the 4 layers, selecting all pageItems.

    for (var j = 0; j < theLayer.layers.length; j++) {
        var jLayer = theLayer.layers[j];
        for (i = 0; i < jLayer.pageItems.length; i++) {
            currentItem = jLayer.pageItems[i];
            currentItem.selected = true;
        }

        for (var k = 0; k < jLayer.layers.length; k++) {
            var kLayer = jLayer.layers[k];
            for (i = 0; i < kLayer.pageItems.length; i++) {
                currentItem = kLayer.pageItems[i];
                currentItem.selected = true;
            }

            for (var l = 0; l < kLayer.layers.length; l++) {
                var lLayer = kLayer.layers[l];
                for (i = 0; i < lLayer.pageItems.length; i++) {
                    currentItem = lLayer.pageItems[i];
                    currentItem.selected = true;
                }

                for (var m = 0; m < lLayer.layers.length; m++) {
                    var mLayer = lLayer.layers[m];
                    for (i = 0; i < lLayer.pageItems.length; i++) {
                        currentItem = mLayer.pageItems[i];
                        currentItem.selected = true;
                    }
/*
                    for (var n = 0; n < mLayer.layers.length; n++) {
                        var nLayer = mLayer.layers[n];
                        for (i = 0; i < lLayer.pageItems.length; i++) {
                            currentItem = nLayer.pageItems[i];
                            currentItem.selected = true;
                        }

                        for (var o = 0; o < mLayer.layers.length; o++) {
                            var oLayer = mLayer.layers[o];
                            for (i = 0; i < lLayer.pageItems.length; i++) {
                                currentItem = oLayer.pageItems[i];
                                currentItem.selected = true;
                            }
                        }
                    }
*/
                }
            }
        }
    }
}


// Given a layer to start with, and name, search 8 sublayers deep for the layer with the id (without class: designations) of 'name'
function getLayerByID(name) {
    // If we find the layer with an id == name return that layer

    for (var j = 0; j < idoc.layers.length; j++) {
        var jLayer = idoc.layers[j];
        if (checkID(jLayer, name) == true) {
            return jLayer;
        }

        for (var k = 0; k < jLayer.layers.length; k++) {
            var kLayer = jLayer.layers[k];
            if (checkID(kLayer, name) == true) {
                return kLayer;
            }

            for (var l = 0; l < kLayer.layers.length; l++) {
                var lLayer = kLayer.layers[l];
                if (checkID(lLayer, name) == true) {
                    return lLayer;
                }

                for (var m = 0; m < lLayer.layers.length; m++) {
                    var mLayer = lLayer.layers[m];
                    if (checkID(mLayer, name) == true) {
                        return mLayer;
                    }

                    for (var n = 0; n < mLayer.layers.length; n++) {
                        var nLayer = mLayer.layers[n];
                        if (checkID(nLayer, name) == true) {
                            return nLayer;
                        }

                        for (var o = 0; o < nLayer.layers.length; o++) {
                            var oLayer = nLayer.layers[o];
                            if (checkID(oLayer, name) == true) {
                                return oLayer;
                            }

                            for (var p = 0; p < oLayer.layers.length; p++) {
                                var pLayer = oLayer.layers[p];
                                if (checkID(pLayer, name) == true) {
                                    return pLayer;
                                }

                                for (var q = 0; q < pLayer.layers.length; q++) {
                                    var qLayer = pLayer.layers[q];
                                    if (checkID(qLayer, name) == true) {
                                        return qLayer;
                                    }

                                    for (var r = 0; r < qLayer.layers.length; r++) {
                                        var rLayer = qLayer.layers[r];
                                        if (checkID(rLayer, name) == true) {
                                            return rLayer;
                                        }

                                        for (var s = 0; s < rLayer.layers.length; s++) {
                                            var sLayer = rLayer.layers[s];
                                            if (checkID(sLayer, name) == true) {
                                                return sLayer;
                                            }

                                            for (var t = 0; t < sLayer.layers.length; t++) {
                                                var tLayer = sLayer.layers[t];
                                                if (checkID(tLayer, name) == true) {
                                                    return tLayer;
                                                }

                                                for (var u = 0; u < tLayer.layers.length; u++) {
                                                    var uLayer = tLayer.layers[u];
                                                    if (checkID(uLayer, name) == true) {
                                                        return uLayer;
                                                    }

                                                    for (var v = 0; v < uLayer.layers.length; v++) {
                                                        var vLayer = uLayer.layers[v];
                                                        if (checkID(vLayer, name) == true) {
                                                            return vLayer;
                                                        }

                                                        for (var w = 0; w < vLayer.layers.length; w++) {
                                                            var wLayer = vLayer.layers[w];
                                                            if (checkID(wLayer, name) == true) {
                                                                return wLayer;
                                                            }

                                                            for (var x = 0; x < wLayer.layers.length; x++) {
                                                                var xLayer = wLayer.layers[x];
                                                                if (checkID(xLayer, name) == true) {
                                                                    return xLayer;
                                                                }

                                                                for (var y = 0; y < xLayer.layers.length; y++) {
                                                                    var yLayer = xLayer.layers[y];
                                                                    if (checkID(yLayer, name) == true) {
                                                                        return yLayer;
                                                                    }

                                                                    for (var z = 0; z < yLayer.layers.length; z++) {
                                                                        var zLayer = yLayer.layers[z];
                                                                        if (checkID(zLayer, name) == true) {
                                                                            return zLayer;
                                                                        }

                                                                        for (var a = 0; a < zLayer.layers.length; a++) {
                                                                            var aLayer = zLayer.layers[a];
                                                                            if (checkID(aLayer, name) == true) {
                                                                                return aLayer;
                                                                            }

                                                                            for (var b = 0; b < aLayer.layers.length; b++) {
                                                                                var bLayer = aLayer.layers[b];
                                                                                if (checkID(bLayer, name) == true) {
                                                                                    return bLayer;
                                                                                }

                                                                                for (var c = 0; c < bLayer.layers.length; c++) {
                                                                                    var cLayer = bLayer.layers[c];
                                                                                    if (checkID(cLayer, name) == true) {
                                                                                        return cLayer;
                                                                                    }

                                                                                    for (var d = 0; d < cLayer.layers.length; d++) {
                                                                                        var dLayer = cLayer.layers[d];
                                                                                        if (checkID(dLayer, name) == true) {
                                                                                            return dLayer;
                                                                                        }

                                                                                        for (var e = 0; e < dLayer.layers.length; e++) {
                                                                                            var eLayer = dLayer.layers[e];
                                                                                            if (checkID(eLayer, name) == true) {
                                                                                                return eLayer;
                                                                                            }

                                                                                            for (var f = 0; f < eLayer.layers.length; f++) {
                                                                                                var fLayer = eLayer.layers[f];
                                                                                                if (checkID(fLayer, name) == true) {
                                                                                                    return fLayer;
                                                                                                }

                                                                                                for (var g = 0; g < fLayer.layers.length; g++) {
                                                                                                    var gLayer = fLayer.layers[g];
                                                                                                    if (checkID(gLayer, name) == true) {
                                                                                                        return gLayer;
                                                                                                    }
                                                                                                }

                                                                                                for (var h = 0; h < gLayer.layers.length; h++) {
                                                                                                    var hayer = gLayer.layers[h];
                                                                                                    if (checkID(hLayer, name) == true) {
                                                                                                        return hLayer;
                                                                                                    }

                                                                                                    for (var i = 0; i < hLayer.layers.length; i++) {
                                                                                                        var iLayer = hLayer.layers[i];
                                                                                                        if (checkID(iLayer, name) == true) {
                                                                                                            return iLayer;
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return null;
}

