function ratio( w , h ){
    function gcd (a, b) {
        return (b == 0) ? a : gcd (b, a%b);
    }
    var r = gcd (w, h);
    return [ w/r,h/r ]
}

function getNewWidth( h, r ){
    var mult = h/r[1];
    return mult*r[0];
}