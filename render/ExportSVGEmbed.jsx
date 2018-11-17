// we put the whole program into the function doEverything so that we can use return to terminate execution on an error.
doEverything();

function doEverything() {

    // Export the file to SVG - this will change the current open file from .ai to .svg
    var dest = app.activeDocument.path + "/" + app.activeDocument.name;
    exportFileToSVG(dest);

    // Now save as a .ai file - both to save our work, and to change the open file back to .ai from .svg
    app.activeDocument.save(dest, SaveOptions.SAVECHANGES );
}

// Exports current document to dest as an SVG file with specified
// options, dest contains the full path including the file name
// Unfortunately, it still REPLACES the current AI doc with the SVG doc.

function exportFileToSVG (dest) {
    if ( app.documents.length > 0 ) {
        var exportOptions = new ExportOptionsSVG();
        var type = ExportType.SVG;
        var fileSpec = new File(dest);
        exportOptions.embedRasterImages = true;
        exportOptions.embedAllFonts = false;
        exportOptions.coordinatePrecision = 1;
        exportOptions.fontSubsetting = SVGFontSubsetting.GLYPHSUSED;
        exportOptions.cssProperties = SVGCSSPropertyLocation.STYLEELEMENTS;
        app.activeDocument.exportFile( fileSpec, type, exportOptions );
    }
}