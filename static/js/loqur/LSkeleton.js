

function LBone(id, parent, baseSize, length, location, rotation){
  this.id = id;
  this.parent = parent;
  this.location = location.copy();
  this.rotation = rotation.copy();
  this.length = length;
  this.base = baseSize;
}

LBone.prototype.copy = function(){
  return new LBone(this.id, this.parent, this.base, this.length, this.location, this.rotation);
};

LBone.prototype.toString = function(){
  return JSON.stringify({id:this.id, location:this.location,rotation:this.rotation,length:this.length,base:this.base});
};

LBone.fromString = function(s, parent){
  parent = parent || null;
  var ob = JSON.parse(s);
  return new LBone(ob.id, parent, ob.base, ob.length, LV3.fromJSON(ob.location), LV3.fromJSON(ob.rotation));
};

LBone.prototype.qt = function(){
  if(this.parent == null) return LQt.rotation(this.rotation.x, this.rotation.y, this.rotation.z);
  else{
    var myQt = LQt.rotation(this.rotation.x, this.rotation.y, this.rotation.z);
    return this.parent.qt().mult(myQt);
  }
};

LBone.prototype.tip = function(){
  var p, myQt;
  if(this.parent == null){ //for the base, the tip is just the end + the base (location)
    p = new LV3(this.length, 0, 0);
    myQt = LQt.rotation(this.rotation.x, this.rotation.y, this.rotation.z);
    myQt.multLV3(p);
    return p.add(this.location);
  }else{ //otherwise, it is the other tip,
    p = new LV3(this.length, 0, 0);

    myQt = this.qt()
    myQt.multLV3(p);
    var l = this.location.copy();
    var qt2 = this.parent.qt();
    qt2.multLV3(l);
    return p.add(this.parent.tip()).add(l);
  }
};


LBone.prototype.loc = function(){
  if(this.parent == null) return this.location.copy();
  else{
    var pqt = this.parent.qt();
    var l = this.location.copy();
    pqt.multLV3(l);
    return this.parent.tip().add(l);
  }
};


LBone.prototype.getModel = function(){
  var ret = new L3DOb();
  var hs = this.base / 2;
  ret.verts.push(new LV3(-hs, -hs, hs));
  ret.verts.push(new LV3(hs, -hs, hs));
  ret.verts.push(new LV3(hs, hs, hs));
  ret.verts.push(new LV3(-hs, hs, hs));
  ret.verts.push(new LV3(-hs, -hs, -hs));
  ret.verts.push(new LV3(hs, -hs, -hs));
  ret.verts.push(new LV3(hs, hs, -hs));
  ret.verts.push(new LV3(-hs, hs, -hs));
  ret.verts.push(new LV3(this.length, 0, 0));
  ret.verts.push(new LV3(0, this.base*1.5, 0));


  //front
  ret.faces.push([0,1,2]);
  ret.faces.push([0,2,3]);
  //back:
  ret.faces.push([4,7,6]);
  ret.faces.push([4,6,5]);
  //l-side:
  ret.faces.push([0,3,7]);
  ret.faces.push([0,7,4]);
  //r-side:
  //ret.faces.push([2,6,1]);
  //ret.faces.push([6,5,1]);
  //top:
  //ret.faces.push([3,2,6]);
  //ret.faces.push([3,6,7]);
  //bottom:
  ret.faces.push([4,5,0]);
  ret.faces.push([0,5,1]);

  //pyra#1
  ret.faces.push([1,8,2]);
  ret.faces.push([2,8,6]);
  ret.faces.push([5,6,8]);
  ret.faces.push([1,5,8]);

  //top-pyra
  ret.faces.push([3,2,9]);
  ret.faces.push([2,6,9]);
  ret.faces.push([7,9,6]);
  ret.faces.push([3,9,7]);

  var qt = this.qt();
  var loc = this.loc();
  for(var i = 0; i < ret.verts.length; i++){
    qt.multLV3(ret.verts[i]);
    ret.verts[i].iadd(loc);
  }


  return ret;

};
