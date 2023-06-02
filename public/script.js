function account(n) {
    if (n == -1) {
        var x = document.getElementsByClassName('abs')
        x[0].style.display = "none";
        x[1].style.display = "none";
    }
    else {
        var x = document.getElementsByClassName('abs')[n]
        if (n == 0) {
            var k = 1;
        }
        else {
            var k = 0;
        }
        var y = document.getElementsByClassName('abs')[k]
        if (x.style.display == "none") {
            x.style.display = "flex";
            y.style.display = "none";
        }
        else {
            x.style.display = "none";
            y.style.display = "none";
        }
    }
}


function select() {
    var x = document.getElementsByName('userType')[0]
    var y = document.getElementsByName("subject")[0]
    if (x.value === 'Faculty') {
        y.removeAttribute('disabled');
    }
    else {
        y.disabled = true;

    }
}
