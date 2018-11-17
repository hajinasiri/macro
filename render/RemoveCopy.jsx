// we put the whole program into the function doEverything so that we can use return to terminate execution on an error.
doEverything();

function doEverything() {

deleteCopy('copy');

}

// checkID always returns false - so the nested loops finish gong through all the layers

function checkID(aLayer, theName) {
    var strPos;

    if ( (strPos = aLayer.name.search(theName)) >= 0 ) {    // We found it!
        aLayer.name = aLayer.name.substr(0, strPos);
        return false;
    }

    else {
        return false;
    }
}

// Copied from AI2CSV

function deleteCopy(name) {
    // If we find the layer with an id == name return that layer

    var idoc = app.activeDocument;

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