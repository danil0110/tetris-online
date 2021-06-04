const username = document.querySelector('#username');
const password = document.querySelector('#password');
const btnLogin = document.querySelector('#btn-login');

const areSame = (v1, v2) => {
	if (v1 === v2) {
		return true;
	}

	return false;
};

const showError = message => {
	let errorLabel;
	if (!document.querySelector('.auth-error')) {
		errorLabel = document.createElement('p');
		errorLabel.classList.add('auth-error');
		errorLabel.textContent = message;

		return btnLogin.insertAdjacentElement('beforebegin', errorLabel);
	}

	errorLabel = document.querySelector('.auth-error');
	errorLabel.textContent = message;
};

const login = async ({ username, password }) => {
	const res = await fetch('http://localhost:4000/api/auth/login', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const data = await res.json();

	if (!data.error) {
		const obj = {
			userId: data.UserID,
			username: data.Username,
		};
		localStorage.setItem('current-user', JSON.stringify(obj));
		return (location.pathname = '/client/index.html');
	}

	showError(data.message);
};

btnLogin.addEventListener('click', e => {
	e.preventDefault();

	const body = {
		username: username.value,
		password: password.value,
	};
	login(body);
});
