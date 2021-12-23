function print_my_full_name (name) {
	Name = "Dr " + name + " Gerdelan";
	var p_name = document.getElementById("p_name");
	p_name.innerHTML = name;
}

function start_here () {
	var my_first_name = "Anton";
	var my_age = 30;
	print_my_full_name (my_first_name);
}

start_here ();
