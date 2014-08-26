package ffxiv.fisher.servlet.admin;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import ffxiv.fisher.model.Fish;
import ffxiv.fisher.service.FishService;
import ffxiv.fisher.servlet.HttpResponseCode;

/**
 * Adds a new fish to the database.  Meant for administrators only.
 */
@Singleton
public class AdminFishServlet extends HttpServlet {

	private static final Logger log = Logger.getLogger(AdminFishServlet.class.getName());
	
	private static final long serialVersionUID = 337121127107680287L;
	
	private final FishService fishService;
	
	@Inject
	public AdminFishServlet(FishService fishesService) {
		this.fishService = fishesService;
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		// TODO If key is specified, update instead.
		
		Gson gson = new Gson();
		Fish fish = gson.fromJson(req.getReader(), Fish.class);
		try {
			fishService.storeNewFish(fish);
		} catch (IllegalArgumentException e) {
			log.severe(e.getMessage());
			resp.sendError(HttpResponseCode.BAD_REQUEST.getCode());
			return;
		}
		
	}
}
