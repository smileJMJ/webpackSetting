import Ryan from '../img/ryan.jpg';

interface User {
    name: string;
    age: number;
}

const saveUser = (user: User) => {
    console.log(`Name: ${user.name}, Age: ${user.age}`);
};

saveUser({name: 'User1', age: 20});