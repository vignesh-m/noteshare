var error = {};

error.ERR_DESCRIPTION = {
	"102":"Wrong parameters for search",
	"420":"Insufficient parameters passed"
};

error.err = function( res, code, desc ){
	res.end(JSON.stringify(
		{ result:false, err:{ code:code, description: ( desc || error.ERR_DESCRIPTION[code] || "No description" ) } }
		));
}

error.err_insuff_params = function( res, req,  arr ) {
	var errobj = { params:[] };
	for(var i=0;i<arr.length;i++) {
		param = arr[i];
		if( !(req.query[param]) )
			errobj.params.push(param);
	}

	if( errobj.params.length ){
		res.end(JSON.stringify(
			{ result:false, err:{ code:420, description: errobj.params } }
			));
		return false;
	}

	return true;

}

module.exports = error;
