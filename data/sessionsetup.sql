create table public.sessions (
	id bigint primary key,
	studentID bigint not null,
	mentorID bigint not null,
	status varchar(13) default 'verifying' not null,
	agreedTime integer not null,
	elapsedTime integer,
	times integer[],
	notes varchar,
	rating integer check (rating > 1 and rating < 5),
	fee decimal,
	isMentorPaid boolean
);
