
const checkAccess = (requiredRoles) =>{
    return (req,res,next) =>{
        if(!requiredRoles.includes(req.user.role)){
            return res.status(403).send("Access Denied!")
        }
        next()
    }
}

module.exports = checkAccess;