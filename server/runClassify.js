import express from 'express';
import {
	classifyFollowers
} from './aiSorting.js';
import {
	supabase
} from '../src/lib/supabaseClient.js';

const router = express.Router();

const statusMap = {};

function setStatusForUser(userId, obj) {
	statusMap[userId] = {
		...(statusMap[userId] || {}),
		...obj
	};
}

async function getUserFromAuthHeader(req, res) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.split(' ')[1];
	if (!token) {
		res.status(401).json({
			error: 'Missing access token'
		});
		return null;
	}
	const {
		data,
		error
	} = await supabase.auth.getUser(token);
	if (error || !data?.user) {
		res.status(401).json({
			error: 'Invalid token'
		});
		return null;
	}
	return data.user;
}

router.post('/', async (req, res) => {
	try {
		const user = await getUserFromAuthHeader(req, res);
		if (!user) return;

		const settings = req.body?.settings || {};

		setStatusForUser(user.id, {
			state: 'queued',
			progress: 0,
			message: 'Queued',
			startedAt: new Date().toISOString(),
			finishedAt: null
		});

		res.status(202).json({
			message: 'Classification started'
		});

		classifyFollowers(settings, (progressInfo) => {
			setStatusForUser(user.id, {
				state: progressInfo.done ? 'done' : 'running',
				progress: typeof progressInfo.progress === 'number' ? progressInfo.progress : (progressInfo.current && progressInfo.total ? progressInfo.current / progressInfo.total : statusMap[user.id]?.progress || 0),
				message: progressInfo.status || '',
				finishedAt: progressInfo.done ? new Date().toISOString() : null
			});
		}).then(() => {
			setStatusForUser(user.id, {
				state: 'done',
				progress: 1,
				message: 'Completed',
				finishedAt: new Date().toISOString()
			});
		}).catch((err) => {
			console.error('classification failed', err);
			setStatusForUser(user.id, {
				state: 'error',
				message: String(err),
				finishedAt: new Date().toISOString()
			});
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: 'Server error'
		});
	}
});

router.get('/status', async (req, res) => {
	try {
		const user = await getUserFromAuthHeader(req, res);
		if (!user) return;

		const status = statusMap[user.id];
		if (!status) return res.status(404).json({
			error: 'No status'
		});

		return res.json(status);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: 'Server error'
		});
	}
});

export default router;