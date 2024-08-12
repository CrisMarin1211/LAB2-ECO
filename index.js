document.getElementById('fetch-button').addEventListener('click', fetchData);

async function fetchData() {
	renderLoadingState();
	try {
		const [postsResponse, usersResponse] = await Promise.all([
			fetch('http://localhost:3004/posts'),
			fetch('http://localhost:3004/users'),
		]);

		if (!postsResponse.ok || !usersResponse.ok) {
			throw new Error('Network response was not ok');
		}
		const posts = await postsResponse.json();
		const users = await usersResponse.json();

		renderData(posts, users);
	} catch (error) {
		renderErrorState();
	}
}

function renderErrorState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Failed to load data</p>';
	console.log('Failed to load data');
}

function renderLoadingState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Loading...</p>';
	console.log('Loading...');
}

function renderData(posts, users) {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data

	console.log('Posts:', posts); // Verifica los datos de los posts
	console.log('Users:', users); // Verifica los datos de los usuarios

	if (posts.length > 0) {
		posts.forEach((post) => {
			// Convertir userId a cadena para la comparación
			const user = users.find((user) => user.id === post.userId + '');
			const userName = user ? user.name : 'Unknown User';

			console.log(`Post ID: ${post.id}, User ID: ${post.userId}, User Name: ${userName}`);

			const div = document.createElement('div');
			div.className = 'item';
			div.id = `post-${post.id}`; // Asignar un ID único basado en el post ID
			div.innerHTML = `
              <h3>${post.title}</h3>
              <p>${post.body}</p>
              <p><strong>User:</strong> ${userName}</p>
              <button onclick="deletePost('${post.id}')">Delete</button>
            `;
			container.insertBefore(div, container.firstChild); // Agregar al principio
		});
	}
}

function renderSinglePost(post, users) {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data

	// Convertir userId a cadena para la comparación
	const user = users.find((user) => user.id === post.userId + '');
	const userName = user ? user.name : 'Unknown User';

	const div = document.createElement('div');
	div.className = 'item';
	div.id = `post-${post.id}`; // Asignar un ID único basado en el post ID
	div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <p><strong>User:</strong> ${userName}</p>
      <button onclick="deletePost('${post.id}')">Delete</button>
    `;
	container.appendChild(div); // Mostrar solo el nuevo post
}

async function deletePost(postId) {
	try {
		const response = await fetch(`http://localhost:3004/posts/${postId}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to delete post');
		}
		// Eliminar el post de la interfaz sin recargar todos los posts
		const postElement = document.getElementById(`post-${postId}`);
		if (postElement) {
			postElement.remove();
		}
	} catch (error) {
		console.error('Error deleting post:', error);
	}
}

document.getElementById('postForm').addEventListener('submit', async (event) => {
	event.preventDefault();
	const userId = document.getElementById('userId').value;
	const title = document.getElementById('title').value;
	const body = document.getElementById('body').value;

	try {
		const response = await fetch('http://localhost:3004/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, title, body }),
		});
		if (!response.ok) {
			throw new Error('Failed to create post');
		}
		const newPost = await response.json(); // Obtener el post creado
		const usersResponse = await fetch('http://localhost:3004/users');
		const users = await usersResponse.json();

		renderSinglePost(newPost, users); // Mostrar solo el nuevo post
		document.getElementById('postForm').reset();
	} catch (error) {
		console.error('Error creating post:', error);
	}
});
