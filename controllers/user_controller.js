import {UserMysqlStorage} from "../models/user_mysql_storage.js";
import jwt from 'jsonwebtoken';
import {hash} from "../utils/utils.js";

export let userController = {
    insertUser(res, req) {
        const username = req.body.username;
        const password = req.body.password;
        const city = req.body.city;
        const hashValue = hash(password)
        UserMysqlStorage.getUserByUserName(username).then(
            getUserByUserNameResult => {
                if (Object.keys(getUserByUserNameResult).length !== 0) {
                    res.render('register')
                } else {
                    UserMysqlStorage.insertUser(username, hashValue, city).then(
                        result => {
                            res.render('login')
                        }
                    ).catch(error => res.status(500).render(error))
                }
            }
        )
    },
    loginUser(res, req) {
        const username = req.body.username;
        const password = req.body.password;
        const hashValue = hash(password);
        UserMysqlStorage.getUserByUsernamePassword(username, hashValue).then(
            getUserByUsernamePasswordResult => {
                if (Object.keys(getUserByUsernamePasswordResult).length === 1) {
                    const cookie = {
                        "id": getUserByUsernamePasswordResult[0].id,
                        "username": getUserByUsernamePasswordResult[0].username,
                        "city": getUserByUsernamePasswordResult[0].city,
                        "role": getUserByUsernamePasswordResult[0].role
                    }
                    let objJsonStr = JSON.stringify(cookie);
                    let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
                    res.cookie('profile', objJsonB64, {
                        maxAge: 900000,
                        httpOnly: true,
                    });
                    res.render('index');
                } else {
                    // delete the profile cookie from the users browser
                    res.clearCookie('profile');
                    res.render('login')
                }
            }).catch(error => res.status(500).render('error'))
    },
    deleteUser(req, res) {
        const id = req.params.id;
        UserMysqlStorage.getUserById(id).then(
            getUserByIdResult => {
                if (getUserByIdResult[0].role === 2) {
                    res.status(401).render('unauthorized');
                } else {
                    UserMysqlStorage.deleteUserById(id).then(
                        deleteUserByIdResult => {
                            UserMysqlStorage.getUsers().then(
                                getUsersResult => {
                                    res.render('userControl', {userArray: getUsersResult});
                                }
                            )
                        }
                    )
                }
            }
        )
    },
    loginUserSession(req, res) {
        const username = req.body.username;
        const password = req.body.password;
        const hashValue = hash(password);
        UserMysqlStorage.getUserByUsernamePassword(username, hashValue).then(
            getUserByUsernamePasswordResult => {
                if (Object.keys(getUserByUsernamePasswordResult).length === 1) {
                    req.session.userId = getUserByUsernamePasswordResult[0].id
                    req.session.username = getUserByUsernamePasswordResult[0].username;
                    req.session.city = getUserByUsernamePasswordResult[0].city;
                    req.session.role = getUserByUsernamePasswordResult[0].role;
                    res.render('index')
                } else {
                    res.render('loginSession')
                }
            }).catch(error => res.status(500).render('error'))
    },
    loginJWT(req, res) {
        const username = req.body.username;
        const password = req.body.password;
        const hashValue = hash(password);
        UserMysqlStorage.getUserByUsernamePassword(username, hashValue).then(
            getUserByUsernamePasswordResult => {
                if (Object.keys(getUserByUsernamePasswordResult).length === 1) {
                    const id = getUserByUsernamePasswordResult[0].id;
                    const userName = getUserByUsernamePasswordResult[0].username;
                    const city = getUserByUsernamePasswordResult[0].city;
                    const role = getUserByUsernamePasswordResult[0].role;
                    const token = jwt.sign({id, userName, city, role}, 'masterthesis');
                    res.cookie('jwt', token, {httpOnly: true});
                    res.render('index')
                } else {
                    res.render('loginJWT')
                }
            }).catch(error => res.status(500).render('error'))
    }
}
