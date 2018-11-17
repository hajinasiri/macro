/**
 * Some standard security functions for various services. The first serve will be editing the map
 * The user must have admin or editor permissions. If not he must have designer permissions with a list
 * of collection permissions that include the collection that he wants to edit.
 * 
 * -- Larry Maddocks 4/11/2017
 **/

/**
 * Looks in list to see if key is in there. If so returns true
 **/
function inList(list, key) {
  return list.split(',').indexOf(key) > -1;
}

/**
 * Checks that user has permission to edit the map db
 **/
exports.mapEditPermissions = function(collection, req, res, next) {
  var permissions = req.user._doc.doc.permissions;
  if (!(inList(permissions, 'admin') || inList(permissions, 'editor') || inList(permissions, 'designer'))) {
    //  return res.redirect('/'); // not found
    return {
      status: "error",
      msg: 'Invalid permission.'
    };
  }

  //User can have multiple permissions, I suppose. If he has admin permissions and or editor permissions here 
  //then he can upload a spreadsheet. But if he only has designer, then he needs to have the collection
  //in the list of collections he can upload to.
  if (!inList(permissions, 'admin') && !inList(permissions, 'editor') && inList(permissions, 'designer')) {
    var authorizedCollections = req.user._doc.doc.collections;

    if (!inList(authorizedCollections, collection)) {
      //only compare the first folder, which would be > -1 if it were a match.
      return {
        status: "error",
        msg: 'Missing permission for this collection.'
      };
    }
  }
 
  if (!(/master|override/.test(collection))) {
    let err = "Invalid Collection";
    console.error(err);
    // let vm = {
    //   messageTitle: 'Error',
    //   layout: 'simpleLayout',
    //   serverMessage: err
    // };
    // console.error("Incorrect collection.");
    // res.redirect('/error');
    return {
      status: "error",
      msg: "Invalid Collection"
    };
  }
  return {
    status: "success",
    msg: "user has valid permissions"
  };
};
