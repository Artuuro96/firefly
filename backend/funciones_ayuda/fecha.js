

module.exports.obtener = function() {
    Date.prototype.simple_hora = function() {
        var hh = this.getHours().completar_ceros(1);
        var min = this.getMinutes().completar_ceros(1);
        var mm = (this.getMonth() + 1).completar_ceros(1); // getMonth() is zero-based
        var dd = this.getDate().completar_ceros(1);
        return hh + ":" + min + " " + [dd, mm, this.getFullYear()].join('-');
    };

    Number.prototype.completar_ceros = function(numero) {
        return this < Math.pow(10, numero) ? `${"0".repeat(numero)}${this}` : this;
    }

    return new Date().simple_hora();
};