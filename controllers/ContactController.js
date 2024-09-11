export const searchContacts = async (req, res, next) => {
    try {
        const { searchItem} = req.body;

        if ( searchItem === undefined || searchItem === "") {
            return res.status(400).json("Search item is required");
        }

        const sanitizedSearchItem = searchItem.replace(
            /[-[\]{}()*+?.,\\^$|#\s]/g,
            "\\$&"
        );

    } catch {

    }
}