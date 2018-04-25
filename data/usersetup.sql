CREATE TABLE public.users (
	id bigint primary key,
	email varchar not null,
	name varchar not null,
	passwd varchar not null,
	payid varchar,
	phone varchar(10),
	isActive boolean default false,
	skills varchar[],
	currentSession integer default -1,
	pastSessions integer[]
);
