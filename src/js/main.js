import Sub from './sub.js';

const App = () => {
    const div = document.createElement('div');
    div.innerHTML = 'Hello Webpack';
    div.classList.add('hello');

    console.log('main');
    Sub();

    return div;
};

document.body.appendChild(App());