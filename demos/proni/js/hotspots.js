/*
Functions for pulling in information hotspots.
Copyright:   Beyond 2022
Licence:     TBD
Language:    JavaScript
History:
2020 Sep 2: First version. Anton Gerdelan
*/

var hotspots_json_url = "hotspots.json";
var hotspots_image_dir = "images/";
var hotspots_image_format = ".jpg";
var hotspots_scale = 2.0;

function hotspots_init() {
  var xmlhttp = new XMLHttpRequest();
  console.log(" loading hotspots from " + hotspots_json_url);
  xmlhttp.open("GET", hotspots_json_url, true);
  xmlhttp.onload = function (e) {
    let str = xmlhttp.responseText;
    let loaded_json = JSON.parse(str);

    console.log("number of hotspots: " + loaded_json.hotspots.length);
    for (var i = 0; i < loaded_json.hotspots.length; i++) {
      var mesh_name = "hotspot" + i;
      var mesh = BABYLON.MeshBuilder.CreatePlane(mesh_name, { height: 1 }, scene);
      var pos_split = loaded_json.hotspots[i].position_xyz.split(' ');
      mesh.position = new BABYLON.Vector3(parseFloat(pos_split[0]), parseFloat(pos_split[1]), parseFloat(pos_split[2]));
      mesh.rotation.y = parseFloat(loaded_json.hotspots[i].rotation_y_deg) * 0.01745329; // convert to radians
      if (loaded_json.hotspots[i].picture) {
        console.log("hotspot " + i + " picture=" + loaded_json.hotspots[i].picture);
        var image_url = hotspots_image_dir + loaded_json.hotspots[i].picture + hotspots_image_format;
        apply_image_url_to_mesh(image_url, mesh_name, true, false, _hotspot_resize_cb);
      }
    }
  }
  xmlhttp.send();
}

function _hotspot_resize_cb(meshname) {
  let mesh = scene.getNodeByID(meshname);
  var textures = mesh.material.getActiveTextures();
  let w = textures[0].getSize().width; 
  let h = textures[0].getSize().height;
  let aspect = w / h ;
  mesh.scaling.x = hotspots_scale * aspect;
  mesh.scaling.y = hotspots_scale;
}
