export interface RequestListenerEvent {
	fetch: RequestInit
	xhr: XMLHttpRequest
}

export interface RequestListener {
	on: <T extends keyof RequestListenerEvent>(name: T, cb: (url: string, req: RequestListenerEvent[T]) => boolean | void) => RequestListener
	delete: () => void
}

/**
 * Create new request listener
 * @param window - Current window
 * @returns      - Request listener
 */
export const createRequestListener = (win: any = window): RequestListener => {
	/** Cached fetch */
	const fetch = win.fetch
	/** Cached xhr open */
	const open = XMLHttpRequest.prototype.open
	/** Request callbacks */
	const callbacks: Record<keyof RequestListenerEvent, Array<(url: string, req: any) => boolean | void>> = {
		fetch: [],
		xhr: []
	}

	/**
	 * Fetch proxy
	 * @param url  - Fetch url / init
	 * @param init - Fetch init
	 * @returns    - Response
	 */
	const fetchListener: typeof window.fetch = async (req: RequestInfo | URL | string, init?: RequestInit): Promise<Response> => {
		const url = typeof req === 'string' || req instanceof URL
			? req.toString()
			: req.url
		if (callbacks.fetch.some((cb) => cb(url, init) === false))
			return new Response()
		return fetch(url, init)
	}

	/**
	 * XMLHttpRequest open proxy
	 * @param this    - XMLReq
	 * @param method  - Request method
	 * @param url     - Request url
	 */
	const xhrListener: typeof XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: URL | string): void {
		if (callbacks.xhr.some((cb) => cb(url.toString(), this) === false))
			return
		return open.apply(this, [method, url, true])
	}

	/** Listener object */
	const listener: RequestListener = {
		delete: () => {
			XMLHttpRequest.prototype.open = open
			win.fetch = fetch
			callbacks.fetch = []
			callbacks.xhr = []
		},
		on: (name, cb) => {
			if (name in callbacks) {
				callbacks[name].push(cb)
				return listener
			} else {
				throw new Error(`Unknown event name: "${name}"!`)
			}
		}
	}

	XMLHttpRequest.prototype.open = xhrListener
	win.fetch = fetchListener
	return listener
}
export default createRequestListener
