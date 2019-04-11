const projects = [
	{	id					: 1, 
		title				: "Multi-Disciplinary Capstone",
		images				: ["images/liscena.png"],
		short_description	: "Creating an Intelligent Insurance Claims Bot", 
		date 				: "Sept 2018 - April 2019",
		long_description	: "<h2>Creating an Intelligent Insurance Claims Bot</h2><p> As part of our final year capstone project, I worked on a multidisciplinary capstone project along with 4 other engineering students. In this project, we worked along side <a href=‘www.liscena.com’>Liscena</a>, a startup founded by two of the team members. The goal of the project was to improve the insurance claims process by digitizing, automating, and adding intelligence to the initial claims filing cycle, and subsequent follow up. The team collected requirements for the project, brainstormed and designed a solution that took the very complicated First Notice of Loss (FNOL) process and represented it as a chatbot-like implementation, with a heavy focus on user experience.</p><p> Because we were working alongside a startup, there was a lot of flexibility in the design decisions able to be made in building up the infrastructure of the product. I had an opportunity to flex not only my technical implementation skills, but my software design skills, balancing current goals  of the project while continuing to consider future improvements, and integrations. In addition to various front-end tasks, and simple feature implementation tasks, I worked on designing the initial database schema to store all required data for the various aspects of the products, in addition to designing a schema and parser for encoding and decoding complicated logical statements from a human-readable state to a computer parse-able state.</p><p>One important lesson learned from this project is learning to question all assumptions made, and taking into careful consideration what drives value to clients, instead of just trying to make the coolest and exciting product</p><p> As well, since this was part of the Capstone course, there were many documents that were created, starting from collecting requirements and analyzing a business process diagram, to ideation, evaluation of a design, and writing a final report. </p><p> <strong>Skills Developed: </strong> Database Design, JS, AWS, Engineering Report Writing</p> "
	},
	{	id					: 2, 
		title				: "Undergraduate Thesis",
		images				: ["images/thesis.png"],
		short_description	: "Neural Network Approach To Speech Classification From MEG", 
		date 				: "Sept 2018 - April 2019",
		long_description	: "<h2> Neural Network Approach To Speech Classification From MEG </h2><p> As part of my B.a.S.C in Engineering Science, I completed an undergraduate thesis project, supervised under <a href=‘http://www.cs.toronto.edu/~frank/’>Professor Frank Rudzicz</a>. The goal of the project was to use raw magnetoencephalography (MEG) to train a neural network to classify between four different speech tasks in an effort to better understand the relationships between the brain and speech. </p><p> I was able to develop a model that showed some evidence of ‘learning’ various brain features while being trained on only on raw data, without much data preprocessing. This model may be able to be extended to help better understand research the relationship of the brain with speech using raw MEG without the bias of expert knowledge. </p><p> You can find a copy of my final thesis report <a href=Thesis_Final_Report.pdf> here </a></p><p> <strong>Skills Developed: </strong> Machine Learning Research, PyTorch, Neural Networks, MNE</p> "
	},
	{	id					: 3, 
		title				: "YNCN Digital Team",
		images				: ["images/yncn.png"],
		date 				: "Aoril 2018 - March 2019",
		short_description	: "Modernizing The Website for U of T’s Largest Student Club", 
		long_description	: "<h2> Modernizing The Website for U of T’s Largest Student Club </h2><p>You’re Next Career Network is U of T’s largest student run organization, that focuses on providing sorely needed career related services to the students at the university. It has been running resume workshops, career fairs, and more for over 10 years, bringing in around 200 employers to campus, and hosting over 5000 students at events throughout the year. After spending two years on the team running events, I turned my sights to the tech team because the website was a major pain-point despite having 60,000 yearly page views. It had many issues, including an outdated look, confusing navigation, and a lack of utility.</p><p> My co-lead and I put together a team of 5 volunteer student developers and 2 designers, as well as 2 content developers with the goal of improving the website and providing value to students. We met with various stakeholders to establish requirements, develop technical specs, and started rebuilding the website and adding more services. We redesigned the website to have a more modern feel, and added a more visible featured resources section that can be managed to provide topical resources, improved the user experience of the events calendar, digitized the career fair guidebooks to be put onto the website, and automated many processes for updating content on the website (such as updating the calendar, or adding attending companies to the website).</p><p> I believe we created more value on the website, and the analytics backed up this belief, with a reduced bounce rate from 73% to 40% during the peak week (the week of career fair). The average session duration increased from 1m04s to 1m55s, an increase of 80%, and increased the total number of page-views by 73%, while unique sessions only increased by 5%. Most importantly, the team of volunteers all developed their own skills as developers, and developed long lasting relationships, which is something that I love to see as a lead.</p> <p> You can view the website at <a href=‘www.yourenext.ca’> this link </a></p><p> <strong>Skills Developed: </strong> DevOps, Project Management, Leadership, Python (Flask) + Jinja</p>"
	},
	{	id					: 4, 
		title				: "Item 4",
		images				: ["images/g4.jpg"],
		date 				: "Aoril 2018 - March 2019",
		short_description	: "blah", 
		long_description	: "blah blah blah"
	},
	{	id					: 5, 
		title				: "Item 5",
		images				: ["images/g5.jpg"],
		date 				: "Aoril 2018 - March 2019",
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
	img.classList.add("box-img");

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
	modal.find('.modal-date').html(work.date);
}

addEventListener("load", () => {
	load_projects(projects)
})
window.onunload = () => {
	continue;
}