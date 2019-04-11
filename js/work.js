const projects = [
	{	id					: 1, 
		title				: "Item 1",
		images				: ["images/g1.jpg"],
		short_description	: "blah", 
		long_description	: "blah blah blah"
	},
	{	id					: 2, 
		title				: "Item 2",
		images				: ["images/g2.jpg"],
		short_description	: "blah", 
		long_description	: "blah blah blah"
	},
	{	id					: 3, 
		title				: "Item 3",
		images				: ["images/g3.jpg"],
		short_description	: "blah", 
		long_description	: "blah blah blah"
	},
	{	id					: 4, 
		title				: "Item 4",
		images				: ["images/g4.jpg"],
		short_description	: "blah", 
		long_description	: "blah blah blah"
	},
	{	id					: 5, 
		title				: "Item 5",
		images				: ["images/g5.jpg"],
		short_description	: "blah", 
		long_description	: "blah blah blah"
	}
]

function load_projects(projects) {
	const container = get_work_container_div()
	for (const project of projects) {
		const box = create_work(project);
		container.appendChild(box);
	}
}

function create_work(work) {
	const box = document.createElement("div");
	box.classList.add("col-lg-4");
	box.classList.add("col-md-6");
	box.classList.add("work_div");

	box.addEventListener("click", () => {
		console.log("CLICK");
		populate_modal(work);
		const options = {
			keyboard 	: 	true,
			focus		:  	true,
			show		: 	true 
		}
		$('#work_modal').modal(options);
	})

	$(box).data('title', work.title)
	$(box).data('desc', work.long_description)

	const newsgrid = document.createElement("div");
	newsgrid.classList.add("newsgrid_tp");

	const img = document.createElement("img");
	img.setAttribute("src", work.images[0]);
	img.classList.add("img-fluid");

	const txt_div = document.createElement("div");
	txt_div.classList.add("news_bt");

	const title = document.createElement("h4");
	title.innerHTML = work.title;

	const text = document.createElement("p");
	text.classList.add("mt-4");
	text.innerHTML = work.short_description;

	txt_div.appendChild(title);
	txt_div.appendChild(text);
	newsgrid.appendChild(img);
	newsgrid.appendChild(txt_div);

	box.appendChild(newsgrid);

	return box
}

function get_work_container_div() {
	return document.getElementById("works_div")
}

function populate_modal(work) {
	const modal = $("#work_modal");
	modal.find('.modal-title').text(work.title);
	modal.find('.modal-body').html(work.long_description);
}

addEventListener("load", () => {
	load_projects(projects)
})
window.onunload = () => {
	continue;
}