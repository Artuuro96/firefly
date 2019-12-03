module.exports.obtener = function(){
    d = new Date();
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    nd = new Date(utc + (3600000*-10));
    return nd;
}
    