create database agenda_db;

use agenda_db;

create table users(
	id int auto_increment primary key,
    name varchar(70) not null,
    email varchar(100) unique not null
);

ALTER table users ADD COLUMN password varchar(80) not null;

