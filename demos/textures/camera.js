// create a new virtual camera object
function Camera (fov_deg, aspect, nearClip, farClip, wc_pos, direction) {
	this.mFOV_deg = fov_deg;
	this.mAspect = aspect;
	this.mNearClip = nearClip;
	this.mFarClip = farClip;
	this.mWC_Pos = wc_pos;
	this.mDirection = direction;
	this.mViewMat = mat4.create ();
	this.mViewMat = mat4.identity (this.mViewMat);
	// vec3 is a bit unnatural and doesn't like to be mixed some im using arrays explicitly
	var dir = [0, 0, 0];
	dir[0] = wc_pos[0] + direction[0];
	dir[1] = wc_pos[1] + direction[1];
	dir[2] = wc_pos[2] + direction[2];
	this.mViewMat = mat4.lookAt (wc_pos, dir, [0, 1, 0], this.mViewMat);
	this.mProjMat = mat4.create ();
	this.mProjMat = mat4.perspective (this.mFOV_deg, this.mAspect, this.mNearClip, this.mFarClip, this.mProjMat);
	
	this.setPos = function (wc_pos) {
		this.mWC_Pos = wc_pos;
		document.getElementById('campos').innerHTML="cam pos: (" + this.mWC_Pos[0] + ", " + this.this.mWC_Pos[1] + ", " + this.this.mWC_Pos[2] + ")";
		this.mViewMat = mat4.lookAt (this.mWC_Pos, this.mWC_Pos + this.mDirection, [0, 1, 0], this.mViewMat);
	}
	
	this.moveBy = function (wc_dist) {
		var pos = [0, 0, 0];
		pos[0] = wc_dist[0] + this.mWC_Pos[0];
		pos[1] = wc_dist[2] + this.mWC_Pos[1];
		pos[1] = wc_dist[2] + this.mWC_Pos[2];
		//alert("new pos: " + pos[0] + ", " + pos[1] + ", " + pos[2])
		
		this.setPos (pos);
	}
}