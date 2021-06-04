const username = document.querySelector('#username');
const password = document.querySelector('#password');
const repeatPassword = document.querySelector('#repeat-password');
const btnReg = document.querySelector('#btn-register');

const areSame = (v1, v2) => {
	if (v1 === v2) {
		return true;
	}

	return false;
};

const register = async ({ username, password }) => {
	const res = await fetch('http://localhost:4000/api/auth/register', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
		headers: {
			'Content-Type': 'application/json',
		},
	});

	const data = await res.json();

	if (!data.error) {
		location.pathname = '/client/login.html';
	}

	showError(data.message);
};

const showError = message => {
	let errorLabel;
	if (!document.querySelector('.auth-error')) {
		errorLabel = document.createElement('p');
		errorLabel.classList.add('auth-error');
		errorLabel.textContent = message;

		return btnReg.insertAdjacentElement('beforebegin', errorLabel);
	}

	errorLabel = document.querySelector('.auth-error');
	errorLabel.textContent = message;
};

btnReg.addEventListener('click', e => {
	e.preventDefault();

	if (!areSame(password.value, repeatPassword.value)) {
		return showError('Password mismatch');
	}

	const body = {
		username: username.value,
		password: password.value,
	};

	register(body);
});
